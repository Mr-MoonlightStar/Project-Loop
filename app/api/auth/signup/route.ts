import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, workspaceName } = result.data;

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create Workspace and first User as ADMIN atomically
    const newRecord = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "ADMIN", // Acceptance criteria: The creator becomes ADMIN
          workspaceId: workspace.id,
        },
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        workspace: {
          id: workspace.id,
          name: workspace.name,
        },
      };
    });

    return NextResponse.json(
      {
        message: "Account and workspace created successfully",
        data: newRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating your account" },
      { status: 500 }
    );
  }
}
