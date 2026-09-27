import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/db";

/**
 * Calculates cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generates an embedding vector using Google Gemini's official `text-embedding-004`.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "AIzaSy..." || apiKey.trim() === "") {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Gemini embedding generation failed:", error);
    return null;
  }
}

export interface RetrievedFeedbackItem {
  id: string;
  content: string;
  channel: string;
  customerLabel?: string | null;
  sourceRef?: string | null;
  sentiment: string;
  createdAt: Date;
  similarityScore: number;
}

/**
 * Retrieves the top-K most relevant feedback items for a query within a workspace.
 * Uses vector similarity if available, with robust keyword-semantic scoring fallback.
 * HARD RULE: Every query strictly filtered by workspaceId.
 */
export async function retrieveRelevantFeedback(
  workspaceId: string,
  query: string,
  topK: number = 8
): Promise<RetrievedFeedbackItem[]> {
  // 1. Fetch feedback for this tenant along with any stored embeddings
  const allFeedback = await prisma.feedback.findMany({
    where: { workspaceId },
    include: {
      embedding: true,
    },
    take: 300,
  });

  if (allFeedback.length === 0) {
    return [];
  }

  // 2. Generate embedding for query
  const queryVector = await generateEmbedding(query);

  const scoredItems: RetrievedFeedbackItem[] = [];
  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

  for (const item of allFeedback) {
    let similarity = 0;

    // A) If vector is available on both sides, compute cosine similarity
    if (queryVector && item.embedding?.vector) {
      try {
        const itemVector = JSON.parse(item.embedding.vector) as number[];
        similarity = cosineSimilarity(queryVector, itemVector);
      } catch {
        similarity = 0;
      }
    }

    // B) Lexical / BM25-style keyword fallback boost to ensure robust search
    const lowerContent = item.content.toLowerCase();
    let termMatches = 0;
    queryTerms.forEach((term) => {
      if (lowerContent.includes(term)) {
        termMatches++;
      }
    });

    const lexicalScore = queryTerms.length > 0 ? termMatches / queryTerms.length : 0;

    // Blend: if vector available, weight 75% vector + 25% lexical; else 100% lexical
    const finalScore = queryVector ? similarity * 0.75 + lexicalScore * 0.25 : lexicalScore;

    if (finalScore > 0.05 || !queryVector) {
      scoredItems.push({
        id: item.id,
        content: item.content,
        channel: item.channel,
        customerLabel: item.customerLabel,
        sourceRef: item.sourceRef,
        sentiment: item.sentiment,
        createdAt: item.createdAt,
        similarityScore: Math.round(finalScore * 100) / 100,
      });
    }
  }

  // 3. Sort by similarity score descending
  scoredItems.sort((a, b) => b.similarityScore - a.similarityScore);

  return scoredItems.slice(0, topK);
}
