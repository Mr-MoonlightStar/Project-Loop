import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAnalystOrAdmin, requireAnyRole } from "@/lib/rbac";

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
  const query = searchParams.get("q");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
  const skip = (page - 1) * limit;

  try {
    // Build where clause with workspaceId enforcement
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

    const feedback = await prisma.feedback.create({
      data: {
        content: data.content,
        channel: data.channel,
        customerLabel: data.customerLabel || null,
        sourceRef: data.sourceRef || null,
        sentiment: data.sentiment,
        sentimentScore: data.sentimentScore,
        status: "NEW",
        workspaceId: user.workspaceId, // Strict tenant scoping
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Failed to create feedback item" },
      { status: 500 }
    );
  }
}
