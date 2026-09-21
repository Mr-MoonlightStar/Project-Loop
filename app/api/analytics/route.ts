import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnyRole } from "@/lib/rbac";

/**
 * GET /api/analytics
 * Aggregates real feedback metrics for the caller's workspace.
 * Supports dateRange filtering: "7d" | "30d" | "90d" | "all"
 * HARD RULE: Scoped strictly to caller's workspaceId.
 */
export async function GET(req: Request) {
  const auth = await requireAnyRole();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  const { searchParams } = new URL(req.url);
  const dateRange = searchParams.get("dateRange") || "30d";

  const now = new Date();
  let startDate: Date | null = null;

  if (dateRange === "7d") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (dateRange === "30d") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (dateRange === "90d") {
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }

  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const periodWhere: Record<string, unknown> = {
    workspaceId: user.workspaceId,
    ...(startDate ? { createdAt: { gte: startDate } } : {}),
  };

  try {
    // 1. Fetch Key Stats
    const [totalPeriodItems, newThisWeek, posCount, neuCount, negCount, allItems] = await Promise.all([
      prisma.feedback.count({ where: periodWhere }),
      prisma.feedback.count({
        where: {
          workspaceId: user.workspaceId,
          createdAt: { gte: oneWeekAgo },
        },
      }),
      prisma.feedback.count({ where: { ...periodWhere, sentiment: "POS" } }),
      prisma.feedback.count({ where: { ...periodWhere, sentiment: "NEU" } }),
      prisma.feedback.count({ where: { ...periodWhere, sentiment: "NEG" } }),
      prisma.feedback.findMany({
        where: periodWhere,
        select: {
          createdAt: true,
          sentimentScore: true,
          channel: true,
        },
      }),
    ]);

    // Average sentiment score
    const avgScore =
      allItems.length > 0
        ? allItems.reduce((acc, curr) => acc + curr.sentimentScore, 0) / allItems.length
        : 0;

    const negPercentage = totalPeriodItems > 0 ? Math.round((negCount / totalPeriodItems) * 100) : 0;
    const posPercentage = totalPeriodItems > 0 ? Math.round((posCount / totalPeriodItems) * 100) : 0;
    const neuPercentage = totalPeriodItems > 0 ? Math.round((neuCount / totalPeriodItems) * 100) : 0;

    // 2. Aggregate Volume by Date (Chronological)
    const volumeMap: Record<string, number> = {};
    allItems.forEach((item) => {
      const dateStr = item.createdAt.toISOString().split("T")[0];
      volumeMap[dateStr] = (volumeMap[dateStr] || 0) + 1;
    });

    const volumeOverTime = Object.keys(volumeMap)
      .sort()
      .map((date) => ({
        date,
        count: volumeMap[date],
      }));

    // 3. Aggregate Top Themes in the Period
    const feedbackThemes = await prisma.feedbackTheme.findMany({
      where: {
        feedback: periodWhere,
      },
      include: {
        theme: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    const themeCountMap: Record<string, { name: string; count: number; color?: string | null }> = {};
    feedbackThemes.forEach((ft) => {
      if (!themeCountMap[ft.theme.id]) {
        themeCountMap[ft.theme.id] = {
          name: ft.theme.name,
          count: 0,
          color: ft.theme.color,
        };
      }
      themeCountMap[ft.theme.id].count += 1;
    });

    const topThemes = Object.values(themeCountMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // 4. Aggregate Channel Distribution
    const channelMap: Record<string, number> = {};
    allItems.forEach((item) => {
      channelMap[item.channel] = (channelMap[item.channel] || 0) + 1;
    });

    const channelBreakdown = Object.keys(channelMap).map((channel) => ({
      channel,
      count: channelMap[channel],
    }));

    return NextResponse.json({
      dateRange,
      stats: {
        totalFeedback: totalPeriodItems,
        newThisWeek,
        negPercentage,
        posPercentage,
        neuPercentage,
        posCount,
        neuCount,
        negCount,
        avgScore: Math.round(avgScore * 100) / 100,
      },
      charts: {
        volumeOverTime,
        sentimentBreakdown: [
          { name: "Positive", value: posCount, color: "#10B981" },
          { name: "Neutral", value: neuCount, color: "#F59E0B" },
          { name: "Negative", value: negCount, color: "#EF4444" },
        ],
        topThemes,
        channelBreakdown,
      },
    });
  } catch (error) {
    console.error("Error generating analytics:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics data" },
      { status: 500 }
    );
  }
}
