import type { GAMetrics } from "@/lib/ga";
import type { MetaAdsMetrics } from "@/lib/meta-ads";
import type { SCMetrics } from "@/lib/search-console";
import { targets } from "@/lib/targets";
import type { AlertResult } from "./discord";

// Discord embed colors
const COLOR_CRITICAL = 0xed4245;
const COLOR_WARNING = 0xfee75c;
const COLOR_OPPORTUNITY = 0x57f287;
const COLOR_DIGEST = 0x5865f2;

function pctChange(current: number, baseline: number): number {
  if (baseline === 0) return current > 0 ? 100 : 0;
  return ((current - baseline) / baseline) * 100;
}

function fmt(n: number, decimals = 1): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtEur(n: number): string {
  return `\u20ac${fmt(n, 2)}`;
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${fmt(n)}%`;
}

function pad(str: string, len: number): string {
  return str.padEnd(len);
}

function padL(str: string, len: number): string {
  return str.padStart(len);
}

// --- Critical checks (red) ---

export function checkZeroConversions(
  yesterday: GAMetrics,
  baseline: GAMetrics
): AlertResult | null {
  const baselineAvg = baseline.conversions / 7;
  if (yesterday.conversions === 0 && baselineAvg > 0.3) {
    return {
      title: "\ud83d\udea8 Zero Conversions Yesterday",
      description:
        "Yesterday had **0 conversions** (book_a_call events) while the 7-day average is " +
        `**${fmt(baselineAvg)}/day**. The funnel may be broken.`,
      color: COLOR_CRITICAL,
      fields: [
        { name: "Sessions", value: yesterday.sessions.toString(), inline: true },
        {
          name: "Engagement Rate",
          value: `${fmt(yesterday.engagementRate * 100)}%`,
          inline: true,
        },
        { name: "Conversions", value: "0", inline: true },
        { name: "Expected", value: `~${fmt(baselineAvg)}`, inline: true },
      ],
    };
  }
  return null;
}

export function checkSpendNoClicks(
  yesterday: MetaAdsMetrics
): AlertResult | null {
  if (yesterday.spend > 5 && yesterday.linkClicks === 0) {
    return {
      title: "\ud83d\udea8 Spend With No Link Clicks",
      description:
        `Spent **${fmtEur(yesterday.spend)}** yesterday but got **0 link clicks**. ` +
        "Money is burning with zero website traffic.",
      color: COLOR_CRITICAL,
      fields: [
        { name: "Spend", value: fmtEur(yesterday.spend), inline: true },
        { name: "Link Clicks", value: "0", inline: true },
        {
          name: "Impressions",
          value: yesterday.impressions.toLocaleString(),
          inline: true,
        },
      ],
    };
  }
  return null;
}

export function checkCPASpike(
  yesterday: MetaAdsMetrics,
  baseline: MetaAdsMetrics
): AlertResult | null {
  const cpaTarget = targets["meta.cpa"]?.value ?? 15;
  const threshold = cpaTarget * 2;

  if (yesterday.spend > 10 && yesterday.cpa > threshold) {
    const baselineCPA =
      baseline.conversions > 0 ? baseline.spend / baseline.conversions : 0;
    return {
      title: "\ud83d\udea8 CPA Spike",
      description:
        `Yesterday's CPA was **${fmtEur(yesterday.cpa)}**, more than 2\u00d7 the ` +
        `**${fmtEur(cpaTarget)}** target. Unsustainable acquisition cost.`,
      color: COLOR_CRITICAL,
      fields: [
        { name: "Yesterday CPA", value: fmtEur(yesterday.cpa), inline: true },
        { name: "Target CPA", value: fmtEur(cpaTarget), inline: true },
        {
          name: "7-Day Avg CPA",
          value: baselineCPA > 0 ? fmtEur(baselineCPA) : "N/A",
          inline: true,
        },
        { name: "Spend", value: fmtEur(yesterday.spend), inline: true },
        {
          name: "Conversions",
          value: yesterday.conversions.toString(),
          inline: true,
        },
      ],
    };
  }
  return null;
}

// --- Warning checks (amber) ---

export function checkTrafficCollapse(
  yesterday: GAMetrics,
  baseline: GAMetrics
): AlertResult | null {
  const baselineAvg = baseline.sessions / 7;
  if (baselineAvg > 0 && yesterday.sessions < baselineAvg * 0.6) {
    const change = pctChange(yesterday.sessions, baselineAvg);
    return {
      title: "\u26a0\ufe0f Traffic Collapse",
      description:
        `Yesterday's sessions (**${yesterday.sessions}**) dropped to **${fmt(Math.abs(change))}% below** ` +
        `the 7-day average (**${fmt(baselineAvg)}**/day).`,
      color: COLOR_WARNING,
      fields: [
        {
          name: "Yesterday Sessions",
          value: yesterday.sessions.toString(),
          inline: true,
        },
        {
          name: "7-Day Avg",
          value: fmt(baselineAvg, 0),
          inline: true,
        },
        { name: "Change", value: fmtPct(change), inline: true },
      ],
    };
  }
  return null;
}

export function checkFrequencyFatigue(
  yesterday: MetaAdsMetrics
): AlertResult | null {
  if (yesterday.frequency > 3.5 && yesterday.impressions > 1000) {
    return {
      title: "\u26a0\ufe0f Ad Frequency Fatigue",
      description:
        `Average frequency is **${fmt(yesterday.frequency)}** with **${yesterday.impressions.toLocaleString()}** impressions. ` +
        "The same audience is being hammered. Consider creative refresh or audience expansion.",
      color: COLOR_WARNING,
      fields: [
        { name: "Frequency", value: fmt(yesterday.frequency), inline: true },
        {
          name: "Impressions",
          value: yesterday.impressions.toLocaleString(),
          inline: true,
        },
        {
          name: "Reach",
          value: yesterday.reach.toLocaleString(),
          inline: true,
        },
      ],
    };
  }
  return null;
}

// --- Opportunity checks (green) ---

export function checkOrganicCTR(
  yesterday: SCMetrics,
  baseline: SCMetrics
): AlertResult | null {
  const baselineAvgImpressions = baseline.totalImpressions / 7;
  if (baseline.averageCtr < 0.015 && baselineAvgImpressions > 100) {
    return {
      title: "\ud83d\udca1 Organic CTR Underperforming",
      description:
        `Average organic CTR is **${fmt(baseline.averageCtr * 100, 2)}%** with ` +
        `**${fmt(baselineAvgImpressions, 0)} impressions/day**. ` +
        "You rank but nobody clicks. Title tags and meta descriptions are the lever.",
      color: COLOR_OPPORTUNITY,
      fields: [
        {
          name: "Avg CTR",
          value: `${fmt(baseline.averageCtr * 100, 2)}%`,
          inline: true,
        },
        {
          name: "Avg Impressions/Day",
          value: fmt(baselineAvgImpressions, 0),
          inline: true,
        },
        {
          name: "Yesterday Clicks",
          value: yesterday.totalClicks.toString(),
          inline: true,
        },
        {
          name: "Avg Position",
          value: fmt(baseline.averagePosition),
          inline: true,
        },
      ],
    };
  }
  return null;
}

export function checkConversionSpike(
  yesterday: GAMetrics,
  baseline: GAMetrics
): AlertResult | null {
  const yesterdayCVR = yesterday.sessionConversionRate;
  const baselineCVR = baseline.sessionConversionRate;

  if (
    baselineCVR > 0 &&
    yesterdayCVR >= baselineCVR * 2 &&
    yesterday.conversions >= 2
  ) {
    return {
      title: "\ud83d\ude80 Conversion Rate Spike",
      description:
        `Yesterday's conversion rate was **${fmt(yesterdayCVR * 100, 2)}%**, ` +
        `more than 2\u00d7 the 7-day average of **${fmt(baselineCVR * 100, 2)}%**. ` +
        "Something worked \u2014 identify what changed and double down.",
      color: COLOR_OPPORTUNITY,
      fields: [
        {
          name: "Yesterday CVR",
          value: `${fmt(yesterdayCVR * 100, 2)}%`,
          inline: true,
        },
        {
          name: "7-Day Avg CVR",
          value: `${fmt(baselineCVR * 100, 2)}%`,
          inline: true,
        },
        {
          name: "Conversions",
          value: yesterday.conversions.toString(),
          inline: true,
        },
        {
          name: "Sessions",
          value: yesterday.sessions.toString(),
          inline: true,
        },
      ],
    };
  }
  return null;
}

// --- Weekly digest (blue) ---

interface WeeklyData {
  ga: GAMetrics;
  meta: MetaAdsMetrics;
  sc: SCMetrics;
  label: string;
}

function tableRow(
  name: string,
  thisWeek: number,
  lastWeek: number,
  formatter: (n: number) => string,
  invertChange = false
): string {
  const change = pctChange(thisWeek, lastWeek);
  const changeStr = fmtPct(change);
  // For metrics like position where lower = better, invert the indicator
  const isGood = invertChange ? change < 0 : change > 0;
  const isBad = invertChange ? change > 0 : change < 0;
  const indicator = isGood ? "\u2705" : isBad ? "\ud83d\udd3b" : "\u2796";
  return `${pad(name, 18)} ${padL(formatter(thisWeek), 12)} ${padL(formatter(lastWeek), 12)} ${padL(changeStr, 9)} ${indicator}`;
}

export function buildWeeklyDigest(
  lastWeek: WeeklyData,
  prevWeek: WeeklyData
): AlertResult {
  const header =
    `${pad("Metric", 18)} ${padL("This Week", 12)} ${padL("Last Week", 12)} ${padL("Change", 9)}\n` +
    "\u2500".repeat(56);

  const rows = [
    tableRow("Ad Spend", lastWeek.meta.spend, prevWeek.meta.spend, fmtEur),
    tableRow("Ad Conversions", lastWeek.meta.conversions, prevWeek.meta.conversions, (n) => n.toString()),
    tableRow("CPA", lastWeek.meta.cpa, prevWeek.meta.cpa, fmtEur, true),
    tableRow("Sessions", lastWeek.ga.sessions, prevWeek.ga.sessions, (n) => n.toLocaleString()),
    tableRow("GA Conversions", lastWeek.ga.conversions, prevWeek.ga.conversions, (n) => n.toString()),
    tableRow("Engagement Rate", lastWeek.ga.engagementRate * 100, prevWeek.ga.engagementRate * 100, (n) => `${fmt(n)}%`),
    tableRow("Organic Clicks", lastWeek.sc.totalClicks, prevWeek.sc.totalClicks, (n) => n.toLocaleString()),
    tableRow("Organic CTR", lastWeek.sc.averageCtr * 100, prevWeek.sc.averageCtr * 100, (n) => `${fmt(n, 2)}%`),
    tableRow("Avg Position", lastWeek.sc.averagePosition, prevWeek.sc.averagePosition, (n) => fmt(n), true),
  ];

  const table = "```\n" + header + "\n" + rows.join("\n") + "\n```";

  return {
    title: `\ud83d\udcca Weekly Performance Summary (${lastWeek.label})`,
    description: table,
    color: COLOR_DIGEST,
    fields: [],
  };
}
