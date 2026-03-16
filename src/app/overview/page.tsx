"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { format, subDays, differenceInDays } from "date-fns";
import MetricCard from "@/components/dashboard/MetricCard";
import TrafficChart from "@/components/dashboard/TrafficChart";
import FunnelChart from "@/components/dashboard/FunnelChart";
import ChannelMixChart from "@/components/dashboard/ChannelMixChart";
import DateRangePicker from "@/components/dashboard/DateRangePicker";

interface OverviewData {
  ads: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    cpa: number;
    linkClicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    reach: number;
    frequency: number;
    costPerLinkClick: number;
  };
  ga: {
    totalUsers: number;
    sessions: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: number;
    engagementRate: number;
    engagedSessions: number;
    conversions: number;
    sessionConversionRate: number;
  };
  sc: {
    totalClicks: number;
    totalImpressions: number;
    averageCtr: number;
    averagePosition: number;
  };
  previousAds: OverviewData["ads"] | null;
  previousGa: OverviewData["ga"] | null;
  previousSc: OverviewData["sc"] | null;
  adsTimeSeries: Array<{ date: string; spend: number; impressions: number; clicks: number }>;
  gaTimeSeries: Array<{ date: string; sessions: number; users: number }>;
  scTimeSeries: Array<{ date: string; clicks: number; impressions: number }>;
  newVsReturning: Array<{ userType: string; users: number; sessions: number }>;
  channelGrouping: Array<{ channel: string; sessions: number; users: number }>;
  funnel: Array<{ stage: string; value: number }>;
}

export default function OverviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || format(subDays(new Date(), 28), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    searchParams.get("endDate") || format(new Date(), "yyyy-MM-dd")
  );
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const days = differenceInDays(new Date(endDate), new Date(startDate));
    const compareEndDate = format(subDays(new Date(startDate), 1), "yyyy-MM-dd");
    const compareStartDate = format(subDays(new Date(compareEndDate), days), "yyyy-MM-dd");

    const params = new URLSearchParams({
      startDate,
      endDate,
      compareStartDate,
      compareEndDate,
    });

    try {
      const res = await fetch(`/api/overview?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch overview data");
      setData(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    router.replace(`${pathname}?startDate=${start}&endDate=${end}`);
  };

  const prevAds = data?.previousAds;
  const prevGa = data?.previousGa;
  const prevSc = data?.previousSc;

  const blendedCpa =
    data && data.ads.conversions > 0
      ? data.ads.spend / data.ads.conversions
      : 0;
  const prevBlendedCpa =
    prevAds && prevAds.conversions > 0
      ? prevAds.spend / prevAds.conversions
      : undefined;

  const newUsers = data?.newVsReturning.find((r) => r.userType === "new")?.users ?? 0;
  const returningUsers = data?.newVsReturning.find((r) => r.userType === "returning")?.users ?? 0;
  const totalNvr = newUsers + returningUsers;
  const newPct = totalNvr > 0 ? ((newUsers / totalNvr) * 100).toFixed(0) : "0";
  const retPct = totalNvr > 0 ? ((returningUsers / totalNvr) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onRangeChange={handleRangeChange}
        />
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Cross-Channel Overview
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingPlaceholder />
        ) : data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard
                title="Ad Spend"
                value={data.ads.spend}
                format="currency"
                previousValue={prevAds?.spend}
              />
              <MetricCard
                title="Site Sessions"
                value={data.ga.sessions}
                previousValue={prevGa?.sessions}
              />
              <MetricCard
                title="Organic Clicks"
                value={data.sc.totalClicks}
                previousValue={prevSc?.totalClicks}
              />
              <MetricCard
                title="Conversions"
                value={data.ads.conversions}
                previousValue={prevAds?.conversions}
              />
              <MetricCard
                title="Blended CPA"
                value={blendedCpa}
                format="currency"
                tooltip="Total ad spend / total conversions"
                previousValue={prevBlendedCpa}
                invertColor
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="New Users"
                value={newUsers}
                tooltip={`${newPct}% of total users`}
              />
              <MetricCard
                title="Returning Users"
                value={returningUsers}
                tooltip={`${retPct}% of total users`}
              />
              <MetricCard
                title="Site Conversion Rate"
                value={data.ga.sessionConversionRate}
                format="percent"
                tooltip="% of sessions with book_a_call or click events"
                previousValue={prevGa?.sessionConversionRate}
                target={0.03}
                targetLabel="3% target"
              />
              <MetricCard
                title="Engagement Rate"
                value={data.ga.engagementRate}
                format="percent"
                tooltip="% of sessions lasting >10s, 2+ pageviews, or a conversion"
                previousValue={prevGa?.engagementRate}
                target={0.6}
                targetLabel="60% target"
              />
            </div>

            {data.funnel.length > 0 && (
              <FunnelChart
                data={data.funnel}
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>A cross-channel funnel showing the journey from ad impressions to conversions. Each stage represents a step in the customer journey with the drop-off between stages.</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>The bars shrink at each stage as some users drop off.</li>
                      <li>The percentage between stages shows the conversion rate from one step to the next.</li>
                      <li>Numbers are directional (Meta and GA4 have different attribution), but the funnel shape reveals where the biggest drop-offs occur.</li>
                    </ul>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Biggest drop-off</strong> — Where is the funnel leaking most? This is your #1 priority to fix.</li>
                      <li><strong>Ad Impressions to Link Clicks</strong> — Low? Your ad creative isn&apos;t compelling. Refresh creatives.</li>
                      <li><strong>Link Clicks to Sessions</strong> — Low? Your landing page is slow or people bounce before it loads.</li>
                      <li><strong>Sessions to Engaged Sessions</strong> — Low? People land but don&apos;t engage. Check content relevance and page design.</li>
                      <li><strong>Engaged to Conversions</strong> — Low? Your conversion path is broken. Check forms, CTAs, and the booking flow.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Focus optimization efforts on the stage with the worst conversion rate.</li>
                      <li>This funnel directly answers &quot;should we fix the ad or the landing page?&quot;</li>
                      <li>Track funnel improvements period-over-period to validate your changes.</li>
                    </ul>
                  </>
                }
              />
            )}

            {data.channelGrouping.length > 0 && (
              <ChannelMixChart
                data={data.channelGrouping}
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>How your site sessions are distributed across traffic channels: Paid Social, Organic Search, Direct, Referral, Email, etc. This answers &quot;where should the next euro go?&quot;</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <p>Each bar represents a channel. Longer bars mean more sessions from that source. The color coding distinguishes channels at a glance.</p>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Over-reliance on paid</strong> — If Paid Social dominates, your growth depends on ad spend. One budget cut and traffic collapses.</li>
                      <li><strong>Organic strength</strong> — High Organic Search sessions mean your SEO investment is paying off. This is &quot;free&quot; traffic.</li>
                      <li><strong>Direct traffic</strong> — People typing your URL directly. Indicates brand awareness and repeat visitors.</li>
                      <li><strong>Missing channels</strong> — No email traffic? No referral? These are untapped growth opportunities.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>If organic is &lt;20% of total, invest more in content and SEO — it compounds over time.</li>
                      <li>If paid is &gt;50%, build organic channels to reduce paid dependency.</li>
                      <li>A healthy mix: aim for no single channel exceeding 40% of total traffic.</li>
                    </ul>
                  </>
                }
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TrafficChart
                title="Ad Spend & Clicks"
                description="Daily Meta Ads spend and click volume."
                data={data.adsTimeSeries}
                lines={[
                  { key: "clicks", label: "Clicks", color: "#6366f1" },
                  { key: "spend", label: "Spend (\u20ac)", color: "#f43f5e" },
                ]}
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>Daily Meta Ads spend and clicks over the selected period. A quick overview of your paid advertising activity.</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <p>Purple shows click volume, red shows daily spend. They should move roughly in proportion — when you spend more, you should get more clicks.</p>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Widening gap</strong> — Spend growing faster than clicks means declining efficiency.</li>
                      <li><strong>Flat spend, growing clicks</strong> — Great! You&apos;re getting more efficient.</li>
                      <li><strong>Sudden zeros</strong> — Campaign may have been paused, or budget may have been depleted.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Visit the Meta Ads page for detailed campaign-level breakdown.</li>
                      <li>Correlate spend changes with the GA4 sessions chart to see the site-wide impact of ad spend changes.</li>
                    </ul>
                  </>
                }
              />
              <TrafficChart
                title="Site Sessions & Users"
                description="Daily GA4 sessions and unique users."
                data={data.gaTimeSeries}
                lines={[
                  { key: "sessions", label: "Sessions", color: "#6366f1" },
                  { key: "users", label: "Users", color: "#06b6d4" },
                ]}
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>Daily site sessions and unique users from Google Analytics. Your overall site traffic health at a glance.</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <p>Purple = sessions (total visits), teal = unique users. The gap between them shows how often users return within the period.</p>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Upward trend</strong> — Growing traffic. Correlate with ad spend and organic performance to understand what&apos;s driving growth.</li>
                      <li><strong>Sessions growing but users flat</strong> — Same people visiting more often. Good for retention, but you&apos;re not reaching new people.</li>
                      <li><strong>Both declining</strong> — Urgent. Check ad campaigns, SEO rankings, and site uptime.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Visit the Google Analytics page for detailed breakdowns by source, device, and geography.</li>
                      <li>Compare this trend with the ad spend chart — are traffic dips aligned with reduced spend?</li>
                    </ul>
                  </>
                }
              />
              <TrafficChart
                title="Organic Clicks & Impressions"
                description="Daily Search Console organic performance."
                data={data.scTimeSeries}
                lines={[
                  { key: "clicks", label: "Clicks", color: "#10b981" },
                  { key: "impressions", label: "Impressions", color: "#f59e0b" },
                ]}
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>Daily organic search clicks and impressions from Google Search Console. Your SEO performance trend.</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <p>Green = organic clicks (visitors from search), amber = impressions (times you appeared in search results). The ratio between them is your organic CTR.</p>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Growing impressions</strong> — Google is showing your site more often. Your content is gaining visibility.</li>
                      <li><strong>Impressions up, clicks flat</strong> — You appear in search but people don&apos;t click. Improve title tags and meta descriptions.</li>
                      <li><strong>Seasonal patterns</strong> — Some industries have natural search volume cycles. Know your seasonal baseline.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Visit the Search Console page for detailed query and page-level breakdowns.</li>
                      <li>Compare organic trends with paid — if organic grows while paid spend is flat, your SEO investment is working.</li>
                    </ul>
                  </>
                }
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-8">
              Meta Ads
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Impressions"
                value={data.ads.impressions}
                previousValue={prevAds?.impressions}
              />
              <MetricCard
                title="Clicks"
                value={data.ads.clicks}
                previousValue={prevAds?.clicks}
              />
              <MetricCard
                title="CTR"
                value={data.ads.ctr}
                format="percent_raw"
                previousValue={prevAds?.ctr}
              />
              <MetricCard
                title="CPC"
                value={data.ads.cpc}
                format="currency"
                previousValue={prevAds?.cpc}
                invertColor
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-8">
              Google Analytics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Users"
                value={data.ga.totalUsers}
                previousValue={prevGa?.totalUsers}
              />
              <MetricCard
                title="Pageviews"
                value={data.ga.pageviews}
                previousValue={prevGa?.pageviews}
              />
              <MetricCard
                title="Avg. Session"
                value={data.ga.avgSessionDuration}
                format="duration"
                previousValue={prevGa?.avgSessionDuration}
              />
              <MetricCard
                title="Bounce Rate"
                value={data.ga.bounceRate}
                format="percent"
                previousValue={prevGa?.bounceRate}
                invertColor
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-8">
              Search Console
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Impressions"
                value={data.sc.totalImpressions}
                previousValue={prevSc?.totalImpressions}
              />
              <MetricCard
                title="Clicks"
                value={data.sc.totalClicks}
                previousValue={prevSc?.totalClicks}
              />
              <MetricCard
                title="CTR"
                value={data.sc.averageCtr}
                format="percent"
                previousValue={prevSc?.averageCtr}
              />
              <MetricCard
                title="Avg. Position"
                value={data.sc.averagePosition}
                format="decimal"
                previousValue={prevSc?.averagePosition}
                invertColor
              />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}
