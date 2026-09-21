import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, requireAnalystOrAdmin } from "@/lib/rbac";

const updateFeedbackSchema = z.object({
  status: z.enum(["NEW", "REVIEWED", "ACTIONED"]).optional(),
  sentiment: z.enum(["POS", "NEU", "NEG"]).optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
});

/**
 * PATCH /api/feedback/[id]
 * Updates status or sentiment.
 * RBAC: ADMIN or ANALYST only. VIEWERS receive 403 Forbidden.
 * HARD RULE: Scoped strictly to caller's workspaceId.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAnalystOrAdmin();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  const { id } = params;

  try {
    const body = await req.json();
    const result = updateFeedbackSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify item exists within the user's workspace
    const existing = await prisma.feedback.findFirst({
      where: {
        id,
        workspaceId: user.workspaceId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Feedback item not found in this workspace" },
        { status: 404 }
      );
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { error: "Failed to update feedback item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/feedback/[id]
 * Deletes a feedback item.
 * RBAC: ADMIN only. (Analysts and Viewers receive 403 Forbidden).
 * HARD RULE: Scoped strictly to caller's workspaceId.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  const { id } = params;

  try {
    // Verify item belongs to workspace
    const existing = await prisma.feedback.findFirst({
      where: {
        id,
        workspaceId: user.workspaceId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Feedback item not found in this workspace" },
        { status: 404 }
      );
    }

    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback item" },
      { status: 500 }
    );
  }
}
