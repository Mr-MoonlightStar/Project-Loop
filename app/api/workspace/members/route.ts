import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, requireAnyRole } from "@/lib/rbac";
import bcrypt from "bcryptjs";
import { z } from "zod";

const addMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]).default("VIEWER"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().default("loopdemo123"),
});

export async function GET() {
  const auth = await requireAnyRole();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {
    const members = await prisma.user.findMany({
      where: {
        workspaceId: user.workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: user.workspaceId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ members, workspace });
  } catch (error) {
    console.error("GET /api/workspace/members error:", error);
    return NextResponse.json({ error: "Failed to fetch workspace members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {
    const body = await req.json();
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const { name, email, role, password } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newMember = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role,
        workspaceId: user.workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ member: newMember }, { status: 201 });
  } catch (error) {
    console.error("POST /api/workspace/members error:", error);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}
