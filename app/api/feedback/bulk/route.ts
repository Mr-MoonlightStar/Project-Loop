import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAnalystOrAdmin } from "@/lib/rbac";

const rowSchema = z.object({
  content: z.string().min(3, "Content must be at least 3 characters"),
  channel: z.string().min(1, "Channel is required"),
  customerLabel: z.string().optional().nullable(),
  sourceRef: z.string().optional().nullable(),
  sentiment: z.enum(["POS", "NEU", "NEG"]).optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
  createdAt: z.string().optional(),
});

const bulkImportSchema = z.object({
  rows: z.array(z.record(z.string(), z.any())).min(1, "At least one row is required"),
});

/**
 * POST /api/feedback/bulk
 * Accepts an array of parsed CSV rows, validates each row with Zod,
 * saves valid rows with workspaceId, and returns success/failure statistics.
 * RBAC: ADMIN or ANALYST only. VIEWERS receive 403 Forbidden.
 */
export async function POST(req: Request) {
  const auth = await requireAnalystOrAdmin();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {
    const body = await req.json();
    const parsedBody = bulkImportSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    const { rows } = parsedBody.data;
    const validRowsToInsert: Array<{
      content: string;
      channel: string;
      customerLabel: string | null;
      sourceRef: string | null;
      sentiment: "POS" | "NEU" | "NEG";
      sentimentScore: number;
      status: "NEW";
      workspaceId: string;
      createdAt: Date;
      updatedAt: Date;
    }> = [];

    const errors: Array<{ rowNumber: number; reason: string }> = [];

    rows.forEach((row, index) => {
      // Map possible alternative header casing (e.g. "Customer Label", "customer_label")
      const normalized = {
        content: row.content || row.Content || row.text || row.Text || row.feedback || row.Feedback,
        channel: row.channel || row.Channel || row.source || row.Source || "CSV Import",
        customerLabel: row.customerLabel || row.customer_label || row["Customer Label"] || row.customer || null,
        sourceRef: row.sourceRef || row.source_ref || row["Source Ref"] || row.id || null,
        sentiment: (row.sentiment || row.Sentiment)?.toString().toUpperCase(),
        sentimentScore: row.sentimentScore || row.sentiment_score ? parseFloat(row.sentimentScore || row.sentiment_score) : undefined,
        createdAt: row.createdAt || row.created_at || row.Date || row.date,
      };

      const parsed = rowSchema.safeParse(normalized);

      if (!parsed.success) {
        const errorMessages = Object.values(parsed.error.flatten().fieldErrors)
          .flat()
          .join(", ");
        errors.push({
          rowNumber: index + 1,
          reason: errorMessages || "Invalid row format",
        });
      } else {
        const valid = parsed.data;
        const createdAt = valid.createdAt && !isNaN(Date.parse(valid.createdAt))
          ? new Date(valid.createdAt)
          : new Date();

        validRowsToInsert.push({
          content: valid.content,
          channel: valid.channel,
          customerLabel: valid.customerLabel ? String(valid.customerLabel) : null,
          sourceRef: valid.sourceRef ? String(valid.sourceRef) : null,
          sentiment: valid.sentiment || "NEU",
          sentimentScore: typeof valid.sentimentScore === "number" ? valid.sentimentScore : 0,
          status: "NEW",
          workspaceId: user.workspaceId,
          createdAt,
          updatedAt: createdAt,
        });
      }
    });

    if (validRowsToInsert.length > 0) {
      await prisma.feedback.createMany({
        data: validRowsToInsert,
      });
    }

    return NextResponse.json({
      success: true,
      totalRows: rows.length,
      importedCount: validRowsToInsert.length,
      failedCount: errors.length,
      errors: errors.slice(0, 50), // Return top 50 error details to avoid huge payloads
    });
  } catch (error) {
    console.error("Bulk feedback import error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during CSV bulk import" },
      { status: 500 }
    );
  }
}
