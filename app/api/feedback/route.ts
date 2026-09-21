import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAnalystOrAdmin, requireAnyRole } from "@/lib/rbac";
import { classifyFeedback } from "@/lib/ai";

const createFeedbackSchema = z.object({
  content: z.string().min(5, "Feedback content must be at least 5 characters"),
  channel: z.string().min(1, "Channel is required"),
  customerLabel: z.string().optional().nullable(),
  sourceRef: z.string().optional().nullable(),
  sentiment: z.enum(["POS", "NEU", "NEG"]).optional().default("NEU"),
  sentimentScore: z.number().min(-1).max(1).optional().default(0),
});

/**
 * GET /api/feedback
 * Read feedback items — accessible to ALL roles (ADMIN, ANALYST, VIEWER).
 * HARD RULE: Strictly scoped to the authenticated user's workspaceId.
 */
export async function GET(req: Request) {
  const auth = await requireAnyRole();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const channel = searchParams.get("channel");
  const sentiment = searchParams.get("sentiment");
  const themeId = searchParams.get("themeId");
  const dateRange = searchParams.get("dateRange");
  const query = searchParams.get("q");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
  const skip = (page - 1) * limit;

  try {
    // Build where clause with strict workspaceId enforcement
    const whereClause: Record<string, unknown> = {
      workspaceId: user.workspaceId,
    };

    if (status) {
      whereClause.status = status;
    }
    if (channel) {
      whereClause.channel = channel;
    }
    if (sentiment) {
      whereClause.sentiment = sentiment;
    }
    if (themeId) {
      whereClause.themes = {
        some: {
          themeId: themeId,
        },
      };
    }
    if (dateRange && dateRange !== "all") {
      const now = new Date();
      let days = 30;
      if (dateRange === "7d") days = 7;
      if (dateRange === "90d") days = 90;
      whereClause.createdAt = {
        gte: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
      };
    }
    if (query && query.trim()) {
      whereClause.content = {
        contains: query.trim(),
        mode: "insensitive",
      };
    }

    const [items, total] = await Promise.all([
      prisma.feedback.findMany({
        where: whereClause,
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
        skip,
        take: limit,
      }),
      prisma.feedback.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to retrieve feedback items" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feedback
 * Create a single feedback item.
 * RBAC: ADMIN or ANALYST only. VIEWERS receive 403 Forbidden.
 * HARD RULE: Automatically scoped with caller's workspaceId.
 */
export async function POST(req: Request) {
  const auth = await requireAnalystOrAdmin();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {
    const body = await req.json();
    const result = createFeedbackSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Fetch existing themes for workspace
    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId: user.workspaceId },
      select: { id: true, name: true },
    });

    // Run auto-classification (Gemini or fallback)
    const classification = await classifyFeedback(
      data.content,
      existingThemes.map((t) => t.name)
    );

    const feedback = await prisma.feedback.create({
      data: {
        content: data.content,
        channel: data.channel,
        customerLabel: data.customerLabel || null,
        sourceRef: data.sourceRef || null,
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
        status: "NEW",
        workspaceId: user.workspaceId, // Strict tenant scoping
      },
    });

    // Link themes
    for (const themeName of classification.themes) {
      let theme = existingThemes.find((t) => t.name.toLowerCase() === themeName.toLowerCase());
      if (!theme) {
        theme = await prisma.theme.create({
          data: {
            name: themeName,
            workspaceId: user.workspaceId,
            description: `Auto-generated theme for ${classification.featureArea}`,
            color: "#6366F1",
          },
        });
      }

      await prisma.feedbackTheme.create({
        data: {
          feedbackId: feedback.id,
          themeId: theme.id,
          confidence: 0.95,
        },
      });
    }

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Failed to create feedback item" },
      { status: 500 }
    );
  }
}
