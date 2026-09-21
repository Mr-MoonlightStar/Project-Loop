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
    model: "gemini-2.5-flash",
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
