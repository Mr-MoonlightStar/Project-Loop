import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/rbac";
import { z } from "zod";

const updateMemberSchema = z.object({
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {
    const memberId = params.id;

    // Verify member belongs to this workspace
    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        workspaceId: user.workspaceId,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid role", details: parsed.error.format() }, { status: 400 });
    }

    // Prevent admin from removing their own admin status if they are the only admin
    if (member.id === user.id && parsed.data.role !== "ADMIN") {
      const adminCount = await prisma.user.count({
        where: {
          workspaceId: user.workspaceId,
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the only administrator in the workspace" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: memberId },
      data: { role: parsed.data.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ member: updated });
  } catch (error) {
    console.error("PATCH /api/workspace/members/[id] error:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {
    const memberId = params.id;

    if (memberId === user.id) {
      return NextResponse.json({ error: "You cannot remove yourself from the workspace" }, { status: 400 });
    }

    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        workspaceId: user.workspaceId,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true, message: "Member removed from workspace" });
  } catch (error) {
    console.error("DELETE /api/workspace/members/[id] error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
