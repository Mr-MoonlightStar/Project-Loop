import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnyRole } from "@/lib/rbac";

/**
 * GET /api/trends
 * Aggregates theme volume over time and computes week-over-week (or period-over-period) spike detection.
 * Supports period parameter: "7d" | "14d" | "30d" (default: "14d")
 * HARD RULE: Scoped strictly to caller's workspaceId.
 */
export async function GET(req: Request) {
  const auth = await requireAnyRole();
  if (auth.errorResponse) return auth.errorResponse;
  const { user } = auth;

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "14d";

  const now = new Date();
  let days = 14;
  if (period === "7d") days = 7;
  if (period === "30d") days = 30;

  // Current period window: [now - days, now]
  const currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  // Previous period window: [now - 2*days, now - days]
  const prevPeriodStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);

  try {
    // 1. Fetch all themes in workspace
    const themes = await prisma.theme.findMany({
      where: { workspaceId: user.workspaceId },
      include: {
        feedback: {
          include: {
            feedback: {
              select: {
                id: true,
                createdAt: true,
                sentiment: true,
                sentimentScore: true,
              },
            },
          },
        },
      },
    });

    // 2. Compute metrics and spike detection for each theme
    const themeTrends = themes.map((t) => {
      let currentCount = 0;
      let prevCount = 0;
      const totalCount = t.feedback.length;

      let posCount = 0;
      let neuCount = 0;
      let negCount = 0;

      // Map feedback volume by date (YYYY-MM-DD) for current period
      const dailyMap: Record<string, number> = {};

      t.feedback.forEach((ft) => {
        const item = ft.feedback;
        const itemDate = new Date(item.createdAt);

        if (item.sentiment === "POS") posCount++;
        else if (item.sentiment === "NEG") negCount++;
        else neuCount++;

        if (itemDate >= currentPeriodStart && itemDate <= now) {
          currentCount++;
          const dayKey = itemDate.toISOString().split("T")[0];
          dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1;
        } else if (itemDate >= prevPeriodStart && itemDate < currentPeriodStart) {
          prevCount++;
        }
      });

      // Growth rate calculation: ((current - prev) / Math.max(prev, 1)) * 100
      let growthRate = 0;
      if (prevCount === 0) {
        growthRate = currentCount > 0 ? 100 : 0;
      } else {
        growthRate = Math.round(((currentCount - prevCount) / prevCount) * 100);
      }

      // Spike criteria: volume is growing by >= 50% AND currentCount >= 3
      const isSpiking = growthRate >= 50 && currentCount >= 3;

      // Sentiment percentages
      const sentimentTotal = posCount + neuCount + negCount;
      const negPct = sentimentTotal > 0 ? Math.round((negCount / sentimentTotal) * 100) : 0;
      const posPct = sentimentTotal > 0 ? Math.round((posCount / sentimentTotal) * 100) : 0;
      const neuPct = sentimentTotal > 0 ? Math.round((neuCount / sentimentTotal) * 100) : 0;

      return {
        id: t.id,
        name: t.name,
        description: t.description,
        color: t.color || "#6366F1",
        totalCount,
        currentCount,
        prevCount,
        growthRate,
        isSpiking,
        sentiments: {
          posCount,
          neuCount,
          negCount,
          posPct,
          neuPct,
          negPct,
        },
        dailyMap,
      };
    });

    // 3. Sort themes by current period activity
    themeTrends.sort((a, b) => b.currentCount - a.currentCount);

    // 4. Identify spiking themes
    const spikingThemes = themeTrends.filter((t) => t.isSpiking);

    // 5. Aggregate overall timeline for top themes
    // Build array of all dates in current period
    const timelineDates: string[] = [];
    for (let d = new Date(currentPeriodStart); d <= now; d.setDate(d.getDate() + 1)) {
      timelineDates.push(d.toISOString().split("T")[0]);
    }

    const top5Themes = themeTrends.slice(0, 5);
    const timelineData = timelineDates.map((date) => {
      const entry: Record<string, unknown> = { date };
      top5Themes.forEach((t) => {
        entry[t.name] = t.dailyMap[date] || 0;
      });
      return entry;
    });

    return NextResponse.json({
      period,
      periodDays: days,
      spikingCount: spikingThemes.length,
      spikingThemes,
      themes: themeTrends,
      topThemesTimeline: timelineData,
      topThemeNames: top5Themes.map((t) => ({ name: t.name, color: t.color })),
    });
  } catch (error) {
    console.error("Error computing theme trends:", error);
    return NextResponse.json(
      { error: "Failed to compute theme trends and spike detection" },
      { status: 500 }
    );
  }
}
