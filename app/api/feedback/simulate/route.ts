import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAnalystOrAdmin } from "@/lib/rbac";

const simulateSchema = z.object({
  channel: z.enum(["Support Ticket", "App Store", "NPS Survey", "Sales Call", "Community Post"]),
  batchSize: z.number().min(1).max(20).optional().default(5),
});

const SIMULATED_SAMPLES: Record<string, Array<{ content: string; sentiment: "POS" | "NEU" | "NEG"; score: number; customer: string }>> = {
  "Support Ticket": [
    { content: "Users report that PDF export from the reports tab occasionally outputs corrupted charts.", sentiment: "NEG", score: -0.75, customer: "Enterprise Admin" },
    { content: "Thank you for fixing the webhook latency so quickly. Everything is running smoothly now.", sentiment: "POS", score: 0.92, customer: "Integration Lead" },
    { content: "Need clarification on how tenant data isolation is audited across different workspaces.", sentiment: "NEU", score: 0.05, customer: "Compliance Lead" },
    { content: "The CSV uploader failed silently on a file containing semicolons without showing line numbers.", sentiment: "NEG", score: -0.68, customer: "Operations Mgr" },
    { content: "Two-factor authentication prompts on every tab switch. Please remember device for 30 days.", sentiment: "NEG", score: -0.55, customer: "Team Lead" },
    { content: "Live customer chat widget was down between 2 PM and 3 PM UTC today.", sentiment: "NEG", score: -0.80, customer: "Support Specialist" },
  ],
  "App Store": [
    { content: "The clean dark mode UI is gorgeous and makes reviewing customer feedback on iOS a breeze.", sentiment: "POS", score: 0.95, customer: "Mobile Reviewer" },
    { content: "Font size on smaller iPhone screens makes the table rows feel cramped and hard to scan.", sentiment: "NEG", score: -0.52, customer: "iOS User" },
    { content: "Would love a home screen widget showing our weekly sentiment trend.", sentiment: "NEU", score: 0.30, customer: "Tech PM" },
    { content: "App crashed once when attempting to share a Voice-of-Customer digest to Slack.", sentiment: "NEG", score: -0.70, customer: "Product Director" },
    { content: "Hands down the most responsive analytics app on the store right now.", sentiment: "POS", score: 0.93, customer: "Startup Founder" },
  ],
  "NPS Survey": [
    { content: "Project LOOP has saved our executive team dozens of hours every month in sprint planning.", sentiment: "POS", score: 0.98, customer: "NPS 10 (Promoter)" },
    { content: "It does the job, but we really need more integrations with Jira and GitHub issues.", sentiment: "NEU", score: 0.10, customer: "NPS 8 (Passive)" },
    { content: "Pricing tier jump between seats is too high for early-stage teams.", sentiment: "NEG", score: -0.60, customer: "NPS 5 (Detractor)" },
    { content: "The grounded answers in Ask LOOP give us genuine confidence because every point has a citation.", sentiment: "POS", score: 0.94, customer: "NPS 10 (Promoter)" },
  ],
  "Sales Call": [
    { content: "Prospect's security architect confirmed SOC2 compliance is approved for standard deployment.", sentiment: "POS", score: 0.88, customer: "Enterprise Prospect" },
    { content: "Client inquired whether custom retention policies (e.g. 90-day data wipe) can be automated.", sentiment: "NEU", score: 0.15, customer: "Fintech VP" },
    { content: "Deal stalled waiting on Okta SCIM directory provisioning support.", sentiment: "NEG", score: -0.65, customer: "Enterprise Lead" },
    { content: "Client team was blown away by the live theme clustering demo during our product review.", sentiment: "POS", score: 0.96, customer: "E-Commerce Director" },
  ],
  "Community Post": [
    { content: "Just connected our support tickets and the automated classification is shockingly accurate.", sentiment: "POS", score: 0.91, customer: "Community Member" },
    { content: "Is there a webhook triggered when negative feedback spikes in a single day?", sentiment: "NEU", score: 0.25, customer: "DevOps Engineer" },
    { content: "The minimalist B2B dashboard style feels so much cleaner than crowded legacy tools.", sentiment: "POS", score: 0.90, customer: "Product Lead" },
  ],
};

/**
 * POST /api/feedback/simulate
 * Simulates real-time ingestion from an external channel connector.
 * RBAC: ADMIN or ANALYST only. VIEWERS receive 403 Forbidden.
 */
export async function POST(req: Request) {
  const auth = await requireAnalystOrAdmin();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  try {
    const body = await req.json();
    const parsed = simulateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid channel or options", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { channel, batchSize } = parsed.data;
    const pool = SIMULATED_SAMPLES[channel] || SIMULATED_SAMPLES["Support Ticket"];

    // Pick random items from the selected channel pool
    const selectedItems = [];
    for (let i = 0; i < batchSize; i++) {
      const sample = pool[Math.floor(Math.random() * pool.length)];
      selectedItems.push({
        content: sample.content,
        channel,
        customerLabel: sample.customer,
        sourceRef: `SIM-${channel.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}${i}`,
        sentiment: sample.sentiment,
        sentimentScore: sample.score,
        status: "NEW" as const,
        workspaceId: user.workspaceId,
      });
    }

    await prisma.feedback.createMany({
      data: selectedItems,
    });

    return NextResponse.json({
      success: true,
      message: `Simulated ingestion of ${selectedItems.length} items from ${channel} successfully completed.`,
      count: selectedItems.length,
      channel,
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { error: "Failed to simulate channel ingestion" },
      { status: 500 }
    );
  }
}
