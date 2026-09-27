import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnalystOrAdmin, requireAnyRole } from "@/lib/rbac";
import { generateVoCReport, PrecomputedReportData } from "@/lib/ai";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const createReportSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  period: z.enum(["7d", "30d", "90d", "custom"]).default("30d"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET() {
  const auth = await requireAnyRole();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {
    const reports = await prisma.report.findMany({
      where: {
        workspaceId: user.workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        generatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAnalystOrAdmin();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {

    const body = await req.json();
    const parsed = createReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters", details: parsed.error.format() }, { status: 400 });
    }

    const { title, period, startDate, endDate } = parsed.data;

    const now = new Date();
    let periodEnd = now;
    let periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    let periodLabel = "Last 30 Days";

    if (period === "7d") {
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      periodLabel = "Last 7 Days";
    } else if (period === "90d") {
      periodStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      periodLabel = "Last 90 Days";
    } else if (period === "custom" && startDate && endDate) {
      periodStart = new Date(startDate);
      periodEnd = new Date(endDate);
      periodLabel = `${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`;
    }

    // Query feedback strictly within workspace and period
    const feedbackItems = await prisma.feedback.findMany({
      where: {
        workspaceId: user.workspaceId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalVolume = feedbackItems.length;

    // Calculate sentiment breakdown
    let positive = 0;
    let neutral = 0;
    let negative = 0;
    let totalScore = 0;

    for (const item of feedbackItems) {
      if (item.sentiment === "POS") positive++;
      else if (item.sentiment === "NEG") negative++;
      else neutral++;

      totalScore += item.sentimentScore ?? 0;
    }

    const avgSentimentScore = totalVolume > 0 ? totalScore / totalVolume : 0;
    const positivePct = totalVolume > 0 ? Math.round((positive / totalVolume) * 100) : 0;
    const neutralPct = totalVolume > 0 ? Math.round((neutral / totalVolume) * 100) : 0;
    const negativePct = totalVolume > 0 ? Math.round((negative / totalVolume) * 100) : 0;

    // Aggregate themes
    const themeMap: {
      [id: string]: {
        themeId: string;
        name: string;
        count: number;
        sentiment: { positive: number; neutral: number; negative: number };
        sampleQuotes: string[];
      };
    } = {};

    for (const item of feedbackItems) {
      for (const ft of item.themes) {
        if (!themeMap[ft.theme.id]) {
          themeMap[ft.theme.id] = {
            themeId: ft.theme.id,
            name: ft.theme.name,
            count: 0,
            sentiment: { positive: 0, neutral: 0, negative: 0 },
            sampleQuotes: [],
          };
        }
        themeMap[ft.theme.id].count++;
        if (item.sentiment === "POS") themeMap[ft.theme.id].sentiment.positive++;
        else if (item.sentiment === "NEG") themeMap[ft.theme.id].sentiment.negative++;
        else themeMap[ft.theme.id].sentiment.neutral++;

        if (themeMap[ft.theme.id].sampleQuotes.length < 3 && item.content.length > 20) {
          themeMap[ft.theme.id].sampleQuotes.push(item.content);
        }
      }
    }

    const topThemes = Object.values(themeMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((t) => ({
        ...t,
        percentage: totalVolume > 0 ? Math.round((t.count / totalVolume) * 100) : 0,
      }));

    // Critical negative quotes (strong negative sentiment)
    const recentCriticalQuotes = feedbackItems
      .filter((i) => i.sentiment === "NEG" && i.sentimentScore < -0.5)
      .slice(0, 5)
      .map((i) => i.content);

    const precomputedData: PrecomputedReportData = {
      periodLabel,
      totalVolume,
      sentimentBreakdown: {
        positive,
        neutral,
        negative,
        positivePct,
        neutralPct,
        negativePct,
      },
      avgSentimentScore,
      topThemes,
      recentCriticalQuotes:
        recentCriticalQuotes.length > 0
          ? recentCriticalQuotes
          : feedbackItems.filter((i) => i.sentiment === "NEG").slice(0, 3).map((i) => i.content),
    };

    // Synthesize grounded report using Gemini or fallback
    const reportContent = await generateVoCReport(precomputedData);

    const reportTitle =
      title ||
      `Voice of Customer Report — ${periodLabel} (${new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })})`;

    const report = await prisma.report.create({
      data: {
        title: reportTitle,
        periodStart,
        periodEnd,
        contentJson: reportContent as unknown as Prisma.InputJsonValue,
        workspaceId: user.workspaceId,
        generatedById: user.id,
      },
      include: {
        generatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
