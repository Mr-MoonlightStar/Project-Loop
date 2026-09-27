import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAnyRole } from "@/lib/rbac";
import { retrieveRelevantFeedback } from "@/lib/search";
import { answerGroundedQuestion } from "@/lib/ai";

const askSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters"),
});

/**
 * POST /api/insights/ask
 * Grounded Q&A endpoint for Ask LOOP.
 * Retrieves top-K feedback items strictly for caller's workspaceId,
 * runs Gemini grounded inference, and returns response with citations.
 * RBAC: All roles can ask questions.
 * HARD RULE: Every query strictly filtered by workspaceId.
 */
export async function POST(req: Request) {
  const auth = await requireAnyRole();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {
    const body = await req.json();
    const parsed = askSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid question", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { question } = parsed.data;

    // 1. Retrieve top relevant feedback items strictly scoped to this workspace
    const retrievedItems = await retrieveRelevantFeedback(
      user.workspaceId,
      question,
      8
    );

    // 2. Generate grounded answer via Gemini
    const result = await answerGroundedQuestion(question, retrievedItems);

    // 3. Match cited IDs to return citation metadata
    const citedSources = retrievedItems.filter((item) =>
      result.citedFeedbackIds.includes(item.id)
    );

    return NextResponse.json({
      question,
      answer: result.answer,
      isAnswerable: result.isAnswerable,
      summaryHighlights: result.summaryHighlights || [],
      citedSources,
      retrievedCount: retrievedItems.length,
    });
  } catch (error) {
    console.error("Error in Ask LOOP Q&A:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your question" },
      { status: 500 }
    );
  }
}
