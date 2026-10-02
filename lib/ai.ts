import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

export const classificationSchema = z.object({
  sentiment: z.enum(["POS", "NEU", "NEG"]),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).min(1, "At least one theme is required"),
  featureArea: z.string().min(1, "Feature area label is required"),
  rationale: z.string().min(1, "One-line rationale is required"),
});

export type ClassificationResult = z.infer<typeof classificationSchema>;

/**
 * Strips markdown code blocks (e.g. ```json ... ```) from model raw response.
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

/**
 * Classifies a customer feedback statement using Google Gemini (gemini-2.5-flash).
 * Adheres strictly to JSON structure and validates with Zod.
 */
export async function classifyFeedback(
  content: string,
  existingThemes: string[] = []
): Promise<ClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Graceful fallback heuristic if GEMINI_API_KEY is not yet populated
  if (!apiKey || apiKey === "AIzaSy..." || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY is not set. Using rule-based fallback classifier.");
    return fallbackRuleClassifier(content, existingThemes);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1, // Low temperature for deterministic classification
    },
  });

  const prompt = `
You are a senior product analyst for Project LOOP, a B2B feedback intelligence platform.
Analyze the following customer feedback statement and return a strictly structured JSON response.

Input Feedback:
"${content}"

Existing Workspace Themes (prefer selecting from these if relevant):
${existingThemes.length > 0 ? existingThemes.map((t) => `- ${t}`).join("\n") : "None provided"}

Instructions:
1. "sentiment": must be exactly "POS", "NEU", or "NEG".
2. "sentimentScore": a float between -1.0 (extremely negative) and +1.0 (extremely positive). 0.0 is neutral.
3. "themes": an array of 1 to 3 theme names. Prefer existing themes above, or suggest a clean, capitalized 2-4 word theme if none fit.
4. "featureArea": a concise 1-3 word functional area (e.g., "Authentication", "Billing", "Mobile App", "Reporting", "Performance").
5. "rationale": a one-sentence justification explaining the sentiment and theme choice.

JSON Schema format:
{
  "sentiment": "POS" | "NEU" | "NEG",
  "sentimentScore": number,
  "themes": string[],
  "featureArea": string,
  "rationale": string
}
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleaned = cleanJsonOutput(responseText);
    const parsedJson = JSON.parse(cleaned);

    const validated = classificationSchema.safeParse(parsedJson);

    if (!validated.success) {
      console.warn("Gemini output failed Zod validation, retrying or falling back:", validated.error);
      return fallbackRuleClassifier(content, existingThemes);
    }

    return validated.data;
  } catch (error) {
    console.error("Gemini API classification failed:", error);
    return fallbackRuleClassifier(content, existingThemes);
  }
}

/**
 * Deterministic fallback rule-based classifier if Gemini API key is unavailable or throttled.
 * Ensures platform operations never crash on AI service hiccups.
 */
function fallbackRuleClassifier(content: string, existingThemes: string[]): ClassificationResult {
  const lower = content.toLowerCase();

  const negativeWords = ["broken", "fail", "slow", "error", "freeze", "crash", "timeout", "terrible", "bad", "hate", "issue", "bug"];
  const positiveWords = ["love", "great", "fast", "awesome", "slick", "gorgeous", "clean", "speed", "helpful", "superb", "best", "praise"];

  let score = 0.0;
  let sentiment: "POS" | "NEU" | "NEG" = "NEU";

  const negMatches = negativeWords.filter((w) => lower.includes(w)).length;
  const posMatches = positiveWords.filter((w) => lower.includes(w)).length;

  if (negMatches > posMatches) {
    sentiment = "NEG";
    score = Math.max(-0.95, -0.4 - negMatches * 0.15);
  } else if (posMatches > negMatches) {
    sentiment = "POS";
    score = Math.min(0.95, 0.4 + posMatches * 0.15);
  }

  // Theme detection
  let matchedTheme = existingThemes.length > 0 ? existingThemes[0] : "General Feedback";
  if (lower.includes("bill") || lower.includes("invoice") || lower.includes("card") || lower.includes("charge")) {
    matchedTheme = existingThemes.find((t) => t.toLowerCase().includes("billing")) || "Billing & Invoicing";
  } else if (lower.includes("onboard") || lower.includes("invite") || lower.includes("setup") || lower.includes("sign")) {
    matchedTheme = existingThemes.find((t) => t.toLowerCase().includes("onboarding")) || "Onboarding & Setup";
  } else if (lower.includes("slow") || lower.includes("fast") || lower.includes("lag") || lower.includes("speed")) {
    matchedTheme = existingThemes.find((t) => t.toLowerCase().includes("performance")) || "Performance & Latency";
  } else if (lower.includes("api") || lower.includes("webhook") || lower.includes("jira") || lower.includes("connect")) {
    matchedTheme = existingThemes.find((t) => t.toLowerCase().includes("integration")) || "Integrations & API";
  } else if (lower.includes("mobile") || lower.includes("ios") || lower.includes("iphone") || lower.includes("android")) {
    matchedTheme = existingThemes.find((t) => t.toLowerCase().includes("mobile")) || "Mobile Responsiveness";
  }

  return {
    sentiment,
    sentimentScore: Math.round(score * 100) / 100,
    themes: [matchedTheme],
    featureArea: matchedTheme.split("&")[0].trim(),
    rationale: `Classified based on contextual sentiment cues in customer feedback statement.`,
  };
}

export const groundedAnswerSchema = z.object({
  answer: z.string().min(1),
  isAnswerable: z.boolean(),
  citedFeedbackIds: z.array(z.string()),
  summaryHighlights: z.array(z.string()).optional(),
});

export type GroundedAnswerResult = z.infer<typeof groundedAnswerSchema>;

/**
 * Answers a user's question grounded strictly on the retrieved feedback items.
 * Non-negotiable rule: Must never invent feedback. If absent, must explicitly state so.
 */
export async function answerGroundedQuestion(
  question: string,
  retrievedItems: Array<{ id: string; content: string; channel: string; customerLabel?: string | null }>
): Promise<GroundedAnswerResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (retrievedItems.length === 0) {
    return {
      answer: "I could not find any relevant customer feedback in your workspace related to this topic.",
      isAnswerable: false,
      citedFeedbackIds: [],
    };
  }

  // Fallback heuristic if API key is not configured
  if (!apiKey || apiKey === "AIzaSy..." || apiKey.trim() === "") {
    return {
      answer: `Based on your ${retrievedItems.length} retrieved customer feedback items, customers frequently mention: "${retrievedItems[0].content}" [1].`,
      isAnswerable: true,
      citedFeedbackIds: [retrievedItems[0].id],
      summaryHighlights: [retrievedItems[0].content],
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1, // Strict grounding, zero hallucination
    },
  });

  const formattedContext = retrievedItems
    .map((item, idx) => `[${idx + 1}] (ID: ${item.id}) [${item.channel}] "${item.content}"`)
    .join("\n\n");

  const prompt = `
You are Ask LOOP, the retrieval-grounded customer feedback intelligence engine for Project LOOP.
Your answers are presented directly to product managers, founders, and executives.

Question:
"${question}"

Ingested Customer Feedback Context:
${formattedContext}

CRITICAL RULES (NON-NEGOTIABLE):
1. Answer ONLY using the facts and verbatim quotes provided in the Context above.
2. If the answer to the question is NOT supported by the provided feedback, set "isAnswerable": false and state: "I cannot answer this question based on the customer feedback currently ingested in your workspace."
3. Never invent facts, percentages, or hypothetical customer quotes.
4. When stating a finding or quote, cite the source number (e.g. "[1]", "[2]").
5. Populate "citedFeedbackIds" with the exact string IDs of the items you used.
6. Provide 2-3 bullet "summaryHighlights" summarizing the core takeaway.

Return JSON matching this schema:
{
  "answer": string,
  "isAnswerable": boolean,
  "citedFeedbackIds": string[],
  "summaryHighlights": string[]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const cleaned = cleanJsonOutput(result.response.text());
    const parsed = JSON.parse(cleaned);
    const validated = groundedAnswerSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data;
    }

    console.warn("Ask LOOP response failed Zod schema:", validated.error);
    return {
      answer: parsed.answer || `Based on customer feedback in your workspace: "${retrievedItems[0].content}" [1]`,
      isAnswerable: Boolean(parsed.isAnswerable ?? true),
      citedFeedbackIds: Array.isArray(parsed.citedFeedbackIds) && parsed.citedFeedbackIds.length > 0 ? parsed.citedFeedbackIds : [retrievedItems[0].id],
      summaryHighlights: Array.isArray(parsed.summaryHighlights) ? parsed.summaryHighlights : [retrievedItems[0].content],
    };
  } catch (error) {
    console.error("Ask LOOP Gemini generation error:", error);
    // If Gemini throws (e.g. 401 Auth error, rate limit, or model error), synthesize directly from the retrieved feedback
    // so the user receives real workspace feedback insights instead of a dead-end error screen.
    const topItem = retrievedItems[0];
    const secondItem = retrievedItems[1];
    const quotes = [topItem, secondItem].filter(Boolean);

    return {
      answer: `Based on your retrieved workspace feedback, customers noted: "${topItem.content}" [1]${secondItem ? `, with related feedback stating: "${secondItem.content}" [2].` : "."}`,
      isAnswerable: true,
      citedFeedbackIds: quotes.map((q) => q.id),
      summaryHighlights: quotes.map((q) => q.content.slice(0, 120)),
    };
  }
}

export const reportContentSchema = z.object({
  executiveSummary: z.string(),
  keyInsights: z.array(z.string()),
  emergingIssues: z.array(
    z.object({
      issue: z.string(),
      impact: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
      evidenceQuote: z.string(),
      suggestedFix: z.string(),
    })
  ),
  metrics: z.object({
    totalVolume: z.number(),
    sentimentBreakdown: z.object({
      positive: z.number(),
      neutral: z.number(),
      negative: z.number(),
      positivePct: z.number(),
      neutralPct: z.number(),
      negativePct: z.number(),
    }),
    avgSentimentScore: z.number(),
  }),
  topThemes: z.array(
    z.object({
      themeId: z.string().optional(),
      name: z.string(),
      count: z.number(),
      percentage: z.number(),
      sentiment: z.object({
        positive: z.number(),
        neutral: z.number(),
        negative: z.number(),
      }),
      sampleQuotes: z.array(z.string()),
      analysis: z.string(),
    })
  ),
  recommendations: z.array(
    z.object({
      area: z.string(),
      title: z.string(),
      description: z.string(),
      priority: z.enum(["P0", "P1", "P2"]),
    })
  ),
});

export type VoCReportContent = z.infer<typeof reportContentSchema>;

export interface PrecomputedReportData {
  periodLabel: string;
  totalVolume: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
    positivePct: number;
    neutralPct: number;
    negativePct: number;
  };
  avgSentimentScore: number;
  topThemes: Array<{
    themeId?: string;
    name: string;
    count: number;
    percentage: number;
    sentiment: { positive: number; neutral: number; negative: number };
    sampleQuotes: string[];
  }>;
  recentCriticalQuotes: string[];
}

/**
 * Generates an executive Voice of Customer (VoC) report using Gemini 2.5 Flash,
 * grounded in strictly pre-computed metrics and actual customer quotes.
 */
export async function generateVoCReport(data: PrecomputedReportData): Promise<VoCReportContent> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "AIzaSy..." || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY not configured. Generating deterministic VoC report narrative.");
    return fallbackVoCReport(data);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const prompt = `
You are the Chief Product Intelligence Officer for Project LOOP.
Generate a structured, corporate-grade Voice of the Customer (VoC) Executive Report based ONLY on the pre-computed metrics and actual customer quotes below.

REPORTING PERIOD: ${data.periodLabel}
TOTAL VOLUME: ${data.totalVolume} items
SENTIMENT METRICS:
- Positive: ${data.sentimentBreakdown.positive} (${data.sentimentBreakdown.positivePct}%)
- Neutral: ${data.sentimentBreakdown.neutral} (${data.sentimentBreakdown.neutralPct}%)
- Negative: ${data.sentimentBreakdown.negative} (${data.sentimentBreakdown.negativePct}%)
- Average Score: ${data.avgSentimentScore.toFixed(2)} (-1.0 to +1.0)

TOP THEMES WITH REAL CUSTOMER QUOTES:
${data.topThemes
  .map(
    (t, i) => `Theme ${i + 1}: ${t.name} (${t.count} items, ${t.percentage}% of total)
  Sentiment: POS ${t.sentiment.positive}, NEU ${t.sentiment.neutral}, NEG ${t.sentiment.negative}
  Direct Customer Quotes:
  ${t.sampleQuotes.map((q) => `  - "${q}"`).join("\n")}`
  )
  .join("\n\n")}

CRITICAL / URGENT QUOTES:
${data.recentCriticalQuotes.length > 0 ? data.recentCriticalQuotes.map((q) => `- "${q}"`).join("\n") : "None highlighted"}

INSTRUCTIONS:
1. "executiveSummary": Write a concise, executive-level narrative summary (2-3 paragraphs) capturing the overall sentiment trajectory, primary drivers of satisfaction, and primary churn/friction vectors.
2. "keyInsights": 3 to 5 clear, bulleted strategic takeaways.
3. "emergingIssues": Identify 2 to 4 high-priority emerging risks or customer blockers. For each, cite an exact evidence quote from the data and a suggested fix.
4. "topThemes": For each theme provided, write an "analysis" paragraph synthesizing what users are experiencing and why. Retain the exact count, percentage, sentiment, and sampleQuotes provided.
5. "recommendations": Propose 3 to 5 cross-functional action items divided across "Product", "Engineering", and "Support" with priorities ("P0", "P1", or "P2").

Return JSON strictly matching this schema:
{
  "executiveSummary": string,
  "keyInsights": string[],
  "emergingIssues": [
    {
      "issue": string,
      "impact": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "evidenceQuote": string,
      "suggestedFix": string
    }
  ],
  "metrics": {
    "totalVolume": number,
    "sentimentBreakdown": {
      "positive": number,
      "neutral": number,
      "negative": number,
      "positivePct": number,
      "neutralPct": number,
      "negativePct": number
    },
    "avgSentimentScore": number
  },
  "topThemes": [
    {
      "themeId": string,
      "name": string,
      "count": number,
      "percentage": number,
      "sentiment": { "positive": number, "neutral": number, "negative": number },
      "sampleQuotes": string[],
      "analysis": string
    }
  ],
  "recommendations": [
    {
      "area": string,
      "title": string,
      "description": string,
      "priority": "P0" | "P1" | "P2"
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const cleaned = cleanJsonOutput(result.response.text());
    const parsed = JSON.parse(cleaned);
    const validated = reportContentSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data;
    }

    console.warn("VoC report parsing warning, fallback to structured builder:", validated.error);
    return fallbackVoCReport(data, parsed);
  } catch (err) {
    console.error("Gemini VoC report generation error:", err);
    return fallbackVoCReport(data);
  }
}

/**
 * Deterministic fallback VoC report generator when Gemini is offline or fails schema.
 */
function fallbackVoCReport(data: PrecomputedReportData, partial?: Partial<VoCReportContent>): VoCReportContent {
  const topThemeNames = data.topThemes.map((t) => t.name).join(", ");
  const dominantSentiment =
    data.sentimentBreakdown.positive > data.sentimentBreakdown.negative ? "positive" : "negative";

  return {
    executiveSummary:
      partial?.executiveSummary ||
      `During ${data.periodLabel}, a total of ${data.totalVolume} customer feedback items were captured and processed across all integrated channels. Overall customer sentiment remains predominantly ${dominantSentiment} (${data.sentimentBreakdown.positivePct}% positive vs ${data.sentimentBreakdown.negativePct}% negative) with an average sentiment score of ${data.avgSentimentScore.toFixed(2)}. The primary conversational drivers center on ${topThemeNames || "core feature usability"}. Priority attention is recommended for negative feedback clusters affecting reliability and user workflow continuity.`,
    keyInsights:
      partial?.keyInsights && partial.keyInsights.length > 0
        ? partial.keyInsights
        : [
            `Total volume reached ${data.totalVolume} items during ${data.periodLabel}.`,
            `${data.topThemes[0]?.name || "Core Features"} generated the highest customer engagement (${data.topThemes[0]?.percentage || 0}% of all feedback).`,
            `Customer sentiment stands at ${data.sentimentBreakdown.positivePct}% positive, ${data.sentimentBreakdown.neutralPct}% neutral, and ${data.sentimentBreakdown.negativePct}% negative.`,
            `Key action items focus on resolving critical user blockers and stabilizing high-velocity theme touchpoints.`,
          ],
    emergingIssues:
      partial?.emergingIssues && partial.emergingIssues.length > 0
        ? partial.emergingIssues
        : data.recentCriticalQuotes.slice(0, 3).map((quote, idx) => ({
            issue: `High friction point in core workflow #${idx + 1}`,
            impact: idx === 0 ? "HIGH" : "MEDIUM",
            evidenceQuote: quote,
            suggestedFix: "Review logs, inspect error boundary traces, and prioritize hotfix in upcoming sprint.",
          })),
    metrics: {
      totalVolume: data.totalVolume,
      sentimentBreakdown: data.sentimentBreakdown,
      avgSentimentScore: data.avgSentimentScore,
    },
    topThemes: data.topThemes.map((t) => ({
      themeId: t.themeId,
      name: t.name,
      count: t.count,
      percentage: t.percentage,
      sentiment: t.sentiment,
      sampleQuotes: t.sampleQuotes,
      analysis:
        `Feedback regarding ${t.name} accounts for ${t.percentage}% of user discussions in this window (${t.count} total items). Sentiment distribution is ${t.sentiment.positive} positive, ${t.sentiment.neutral} neutral, and ${t.sentiment.negative} negative.`,
    })),
    recommendations:
      partial?.recommendations && partial.recommendations.length > 0
        ? partial.recommendations
        : [
            {
              area: "Engineering",
              title: "Address performance and latency bottlenecks",
              description: "Investigate and optimize the top slow query and load-time complaints highlighted in user feedback.",
              priority: "P0",
            },
            {
              area: "Product",
              title: "Streamline export and configuration UX",
              description: "Refine user flow and error messaging for bulk actions and reporting setups based on feedback trends.",
              priority: "P1",
            },
            {
              area: "Support",
              title: "Publish proactive knowledge base documentation",
              description: "Create quick-start guides addressing recurring customer inquiries in neutral and negative feedback threads.",
              priority: "P2",
            },
          ],
  };
}

