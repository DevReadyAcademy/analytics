import { NextRequest, NextResponse } from "next/server";
import { format, subDays, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { getOverviewMetrics } from "@/lib/ga";
import { getAdsOverview } from "@/lib/meta-ads";
import { getSearchMetrics } from "@/lib/search-console";
import { sendToDiscord } from "@/lib/alerts/discord";
import type { AlertResult } from "@/lib/alerts/discord";
import {
  checkZeroConversions,
  checkSpendNoClicks,
  checkCPASpike,
  checkTrafficCollapse,
  checkFrequencyFatigue,
  checkOrganicCTR,
  checkConversionSpike,
  buildWeeklyDigest,
} from "@/lib/alerts/checks";

function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

async function runDailyChecks(): Promise<{
  checked: number;
  triggered: number;
  alerts: string[];
}> {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const baselineStart = subDays(today, 8);
  const baselineEnd = subDays(today, 2);

  const yesterdayStr = formatDate(yesterday);
  const baselineStartStr = formatDate(baselineStart);
  const baselineEndStr = formatDate(baselineEnd);

  // Fetch all data in parallel
  const [gaYesterday, gaBaseline, metaYesterday, metaBaseline, scYesterday, scBaseline] =
    await Promise.all([
      getOverviewMetrics(yesterdayStr, yesterdayStr),
      getOverviewMetrics(baselineStartStr, baselineEndStr),
      getAdsOverview(yesterdayStr, yesterdayStr),
      getAdsOverview(baselineStartStr, baselineEndStr),
      getSearchMetrics(yesterdayStr, yesterdayStr),
      getSearchMetrics(baselineStartStr, baselineEndStr),
    ]);

  // Run all 7 daily checks
  const results: (AlertResult | null)[] = [
    checkZeroConversions(gaYesterday, gaBaseline),
    checkSpendNoClicks(metaYesterday),
    checkCPASpike(metaYesterday, metaBaseline),
    checkTrafficCollapse(gaYesterday, gaBaseline),
    checkFrequencyFatigue(metaYesterday),
    checkOrganicCTR(scYesterday, scBaseline),
    checkConversionSpike(gaYesterday, gaBaseline),
  ];

  const triggered = results.filter((r): r is AlertResult => r !== null);

  if (triggered.length > 0) {
    await sendToDiscord(triggered);
  }

  return {
    checked: 7,
    triggered: triggered.length,
    alerts: triggered.map((a) => a.title),
  };
}

async function runWeeklyDigest(): Promise<{
  checked: number;
  triggered: number;
  alerts: string[];
}> {
  const today = new Date();

  // Last complete week (Mon-Sun)
  const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

  // Previous week (Mon-Sun)
  const prevWeekStart = startOfWeek(subWeeks(today, 2), { weekStartsOn: 1 });
  const prevWeekEnd = endOfWeek(subWeeks(today, 2), { weekStartsOn: 1 });

  const lwStart = formatDate(lastWeekStart);
  const lwEnd = formatDate(lastWeekEnd);
  const pwStart = formatDate(prevWeekStart);
  const pwEnd = formatDate(prevWeekEnd);

  const [gaLW, gaPW, metaLW, metaPW, scLW, scPW] = await Promise.all([
    getOverviewMetrics(lwStart, lwEnd),
    getOverviewMetrics(pwStart, pwEnd),
    getAdsOverview(lwStart, lwEnd),
    getAdsOverview(pwStart, pwEnd),
    getSearchMetrics(lwStart, lwEnd),
    getSearchMetrics(pwStart, pwEnd),
  ]);

  const weekLabel = `${format(lastWeekStart, "MMM d")}\u2013${format(lastWeekEnd, "MMM d")}`;

  const digest = buildWeeklyDigest(
    { ga: gaLW, meta: metaLW, sc: scLW, label: weekLabel },
    { ga: gaPW, meta: metaPW, sc: scPW, label: "" }
  );

  await sendToDiscord([digest]);

  return {
    checked: 1,
    triggered: 1,
    alerts: [digest.title],
  };
}

export async function POST(request: NextRequest) {
  // Auth check
  const secret = process.env.ALERTS_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "ALERTS_SECRET not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "daily";

  try {
    const result =
      type === "weekly" ? await runWeeklyDigest() : await runDailyChecks();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Alert check failed:", error);
    return NextResponse.json(
      {
        error: "Alert check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
