import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnalystOrAdmin } from "@/lib/rbac";
import { classifyFeedback } from "@/lib/ai";

/**
 * POST /api/feedback/[id]/classify
 * Manually triggers AI re-classification of a feedback item.
 * RBAC: ADMIN or ANALYST only. VIEWERS receive 403 Forbidden.
 * HARD RULE: Scoped strictly to caller's workspaceId.
 */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAnalystOrAdmin();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  const { id } = params;

  try {
    // 1. Verify item exists in caller's workspace
    const feedback = await prisma.feedback.findFirst({
      where: {
        id,
        workspaceId: user.workspaceId,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback item not found in this workspace" },
        { status: 404 }
      );
    }

    // 2. Fetch existing workspace themes so model re-uses them
    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId: user.workspaceId },
      select: { id: true, name: true },
    });

    const themeNames = existingThemes.map((t) => t.name);

    // 3. Call Google Gemini classification service
    const classification = await classifyFeedback(feedback.content, themeNames);

    // 4. Update Feedback record with new sentiment
    await prisma.feedback.update({
      where: { id },
      data: {
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
      },
    });

    // 5. Connect or create Theme associations
    // First remove existing links for this item to enable clean re-classification
    await prisma.feedbackTheme.deleteMany({
      where: { feedbackId: id },
    });

    for (const themeName of classification.themes) {
      // Find or create theme in this workspace
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
          feedbackId: id,
          themeId: theme.id,
          confidence: 0.95,
        },
      });
    }

    // 6. Return fully refreshed record with themes
    const refreshed = await prisma.feedback.findUnique({
      where: { id },
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Feedback successfully re-classified with Google Gemini",
      classification,
      feedback: refreshed,
    });
  } catch (error) {
    console.error("Re-classification error:", error);
    return NextResponse.json(
      { error: "Failed to re-classify feedback item" },
      { status: 500 }
    );
  }
}
