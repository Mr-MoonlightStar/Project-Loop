import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnyRole } from "@/lib/rbac";

/**
 * GET /api/themes
 * Returns all themes created for the caller's workspace, with associated feedback count.
 * HARD RULE: Scoped strictly to caller's workspaceId.
 */
export async function GET() {
  const auth = await requireAnyRole();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {
    const themes = await prisma.theme.findMany({
      where: {
        workspaceId: user.workspaceId,
      },
      include: {
        _count: {
          select: {
            feedback: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ themes });
  } catch (error) {
    console.error("Error fetching workspace themes:", error);
    return NextResponse.json(
      { error: "Failed to retrieve themes" },
      { status: 500 }
    );
  }
}
