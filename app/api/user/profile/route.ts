import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnyRole } from "@/lib/rbac";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { passwordSchema } from "@/lib/validations/auth";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.optional(),
});

export async function GET() {
  const auth = await requireAnyRole();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAnyRole();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.format() }, { status: 400 });
    }

    const { name, currentPassword, newPassword } = parsed.data;

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: { name?: string; passwordHash?: string } = {};

    if (name) {
      updateData.name = name;
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      if (currentUser.passwordHash) {
        const isValid = await bcrypt.compare(currentPassword, currentUser.passwordHash);
        if (!isValid) {
          return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updated, message: "Profile updated successfully" });
  } catch (error) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
