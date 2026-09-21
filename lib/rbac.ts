import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export type Role = "ADMIN" | "ANALYST" | "VIEWER";

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  workspaceId: string;
  workspaceName: string;
}

/**
 * Retrieves the current authenticated user and tenant session.
 * Throws or returns 401 if unauthenticated or tenant scope is missing.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.workspaceId) {
    return null;
  }
  return session.user as SessionUser;
}

/**
 * RBAC helper: ensures the user is authenticated and has one of the allowed roles.
 * Returns { user } on success, or a pre-formatted NextResponse (401 or 403) on failure.
 */
export async function enforceRole(allowedRoles: Role[]): Promise<
  { user: SessionUser; errorResponse: null } | { user: null; errorResponse: NextResponse }
> {
  const user = await getSessionUser();

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          error: "Forbidden: You do not have permission to perform this action",
          requiredRoles: allowedRoles,
          currentRole: user.role,
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

/**
 * Role permission helpers:
 * - Admin: Full access (members, workspace, feedback write, delete)
 * - Analyst: Ingestion, triage, status updates, AI re-classification
 * - Viewer: Read-only access
 */
export async function requireAdmin() {
  return enforceRole(["ADMIN"]);
}

export async function requireAnalystOrAdmin() {
  return enforceRole(["ADMIN", "ANALYST"]);
}

export async function requireAnyRole() {
  return enforceRole(["ADMIN", "ANALYST", "VIEWER"]);
}
