"use client";

import { useEffect, useState, useCallback } from "react";
import { format, subDays, differenceInDays } from "date-fns";
import MetricCard from "@/components/dashboard/MetricCard";
import TrafficChart from "@/components/dashboard/TrafficChart";
import CampaignsTable from "@/components/dashboard/CampaignsTable";
import CreativesTable from "@/components/dashboard/CreativesTable";
import DemographicsChart from "@/components/dashboard/DemographicsChart";
import AudienceBreakdownChart from "@/components/dashboard/AudienceBreakdownChart";
import FrequencyChart from "@/components/dashboard/FrequencyChart";
import PlacementTable from "@/components/dashboard/PlacementTable";
import DateRangePicker from "@/components/dashboard/DateRangePicker";

interface MetaAdsData {
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    reach: number;
    conversions: number;
    linkClicks: number;
    frequency: number;
    cpa: number;
    costPerLinkClick: number;
  };
  previousMetrics: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    reach: number;
    conversions: number;
    linkClicks: number;
    frequency: number;
    cpa: number;
    costPerLinkClick: number;
  } | null;
  timeSeries: Array<{
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
    cpc: number;
    cpm: number;
  }>;
  campaigns: Array<{
    campaignName: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    cpa: number;
  }>;
  creatives: Array<{
    adName: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    videoViews: number;
    thruplays: number;
    costPerThruplay: number;
    score: number;
  }>;
  ageGender: Array<{
    age: string;
    gender: string;
    spend: number;
    impressions: number;
    clicks: number;
    reach: number;
  }>;
  platforms: Array<{ dimension: string; sessions: number; users: number }>;
  frequency: Array<{
    frequency: string;
    reach: number;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  placements: Array<{
    platform: string;
    placement: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
  }>;
}

export default function MetaAdsPage() {
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 28), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState<MetaAdsData | null>(null);
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
      const res = await fetch(`/api/meta-ads?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch Meta Ads data");
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
  };

  const prev = data?.previousMetrics;

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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Meta Ads</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingPlaceholder />
        ) : data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <MetricCard
                title="Total Spend"
                value={data.metrics.spend}
                format="currency"
                previousValue={prev?.spend}
              />
              <MetricCard
                title="Impressions"
                value={data.metrics.impressions}
                tooltip="Total number of times your ads were shown"
                previousValue={prev?.impressions}
              />
              <MetricCard
                title="Clicks"
                value={data.metrics.clicks}
                previousValue={prev?.clicks}
              />
              <MetricCard
                title="Link Clicks"
                value={data.metrics.linkClicks}
                tooltip="Clicks on links within your ad that led to your website"
                previousValue={prev?.linkClicks}
              />
              <MetricCard
                title="Reach"
                value={data.metrics.reach}
                previousValue={prev?.reach}
              />
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              <MetricCard
                title="Frequency"
                value={data.metrics.frequency}
                format="decimal"
                tooltip="Average number of times each person saw your ad"
                previousValue={prev?.frequency}
              />
              <MetricCard
                title="CTR"
                value={data.metrics.ctr}
                format="percent_raw"
                tooltip="Click-Through Rate — percentage of impressions that resulted in a click"
                previousValue={prev?.ctr}
                target={1.5}
                targetLabel="1.5% industry avg"
              />
              <MetricCard
                title="CPC"
                value={data.metrics.cpc}
                format="currency"
                tooltip="Cost Per Click — average cost for each click on your ad"
                previousValue={prev?.cpc}
                invertColor
                target={0.5}
                targetLabel="\u20ac0.50 target"
              />
              <MetricCard
                title="CPM"
                value={data.metrics.cpm}
                format="currency"
                tooltip="Cost Per Mille — cost per 1,000 impressions"
                previousValue={prev?.cpm}
                invertColor
              />
              <MetricCard
                title="Conversions"
                value={data.metrics.conversions}
                tooltip="Total conversion actions (purchases, leads, messages, registrations)"
                previousValue={prev?.conversions}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard
                title="CPA"
                value={data.metrics.cpa}
                format="currency"
                tooltip="Cost Per Acquisition — spend / conversions"
                previousValue={prev?.cpa}
                invertColor
                target={15}
                targetLabel="\u20ac15.00 target"
              />
              <MetricCard
                title="Cost/Link Click"
                value={data.metrics.costPerLinkClick}
                format="currency"
                tooltip="Cost Per Link Click — spend / link clicks"
                previousValue={prev?.costPerLinkClick}
                invertColor
              />
            </div>

            <TrafficChart
              title="Ad Spend & Clicks Over Time"
              description="Daily spend vs clicks. Spot days with high spend but low engagement."
              data={data.timeSeries}
              lines={[
                { key: "clicks", label: "Clicks", color: "#6366f1" },
                { key: "spend", label: "Spend (\u20ac)", color: "#f43f5e" },
              ]}
              infoContent={
                <>
                  <p><strong>What am I looking at?</strong></p>
                  <p>Daily ad spend (red) vs click volume (purple) from Meta Ads. This shows the relationship between how much you&apos;re spending and the engagement you&apos;re getting.</p>

                  <p className="mt-3"><strong>How to read it</strong></p>
                  <p>Both lines should generally move together. When spend rises, clicks should rise proportionally. A widening gap between spend and clicks signals declining efficiency.</p>

                  <p className="mt-3"><strong>What to look for</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Spend up, clicks flat</strong> — You&apos;re paying more for the same results. Check if audience fatigue, increased competition, or poor creative is the cause.</li>
                    <li><strong>Sudden drops in clicks</strong> — Could indicate ad disapprovals, budget depletion, or targeting changes.</li>
                    <li><strong>Weekend patterns</strong> — B2B campaigns may see lower weekend performance. Consider day-parting if so.</li>
                  </ul>

                  <p className="mt-3"><strong>Actions you can take</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>If efficiency drops, refresh creatives or expand audiences to combat fatigue.</li>
                    <li>Pause or reduce spend on days that consistently underperform.</li>
                    <li>Correlate click spikes with campaign launches to identify what works.</li>
                  </ul>
                </>
              }
            />

            <TrafficChart
              title="Cost Trends (CPC & CPM)"
              description="Rising CPC/CPM signals deteriorating unit economics. Critical for budget planning."
              data={data.timeSeries}
              lines={[
                { key: "cpc", label: "CPC (\u20ac)", color: "#f59e0b" },
                { key: "cpm", label: "CPM (\u20ac)", color: "#ef4444" },
              ]}
              infoContent={
                <>
                  <p><strong>What am I looking at?</strong></p>
                  <p>Daily Cost Per Click (CPC) and Cost Per Mille (CPM — cost per 1,000 impressions). These are your unit economics for advertising.</p>

                  <p className="mt-3"><strong>How to read it</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>CPC (amber)</strong> — What you pay each time someone clicks your ad. Lower is better.</li>
                    <li><strong>CPM (red)</strong> — What you pay per 1,000 impressions. Indicates how expensive it is to reach your audience.</li>
                  </ul>

                  <p className="mt-3"><strong>What to look for</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Rising CPC trend</strong> — Advertising is getting more expensive. May indicate audience saturation, increased competition, or declining ad relevance.</li>
                    <li><strong>CPC spikes</strong> — Often coincide with holidays, events, or competitor promotions when ad auction competition intensifies.</li>
                    <li><strong>CPM rising but CPC stable</strong> — Your CTR is improving (good creative) even as impressions cost more.</li>
                    <li><strong>Both rising</strong> — Urgent signal. You&apos;re paying more and getting less. Review targeting and creative immediately.</li>
                  </ul>

                  <p className="mt-3"><strong>Actions you can take</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>When CPC rises: test new creatives, refine audience targeting, or try new placements (Reels often has lower CPC).</li>
                    <li>When CPM rises: broaden your audience to reduce auction competition or shift budget to lower-CPM placements.</li>
                    <li>Set CPC/CPM benchmarks and pause campaigns that consistently exceed them.</li>
                  </ul>
                </>
              }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AudienceBreakdownChart
                data={data.ageGender}
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>A breakdown of your ad audience by age group and gender. Shows who Meta is actually serving your ads to (not just who you&apos;re targeting).</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <p>Each bar represents an age-gender segment. Taller bars mean more spend or impressions going to that group. The split between male and female shows gender distribution.</p>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Mismatch with your ideal customer</strong> — If your service targets 35-54 year olds but most impressions go to 18-24, your targeting needs adjustment.</li>
                      <li><strong>Gender skew</strong> — A significant lean may be intentional or accidental (creative appeals more to one group).</li>
                      <li><strong>High spend on low-converting segments</strong> — Cross-reference with conversion data. If 18-24 gets 40% of spend but 5% of conversions, exclude or reduce that age group.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Narrow age targeting to focus budget on your most responsive demographics.</li>
                      <li>Create age/gender-specific ad creatives that resonate with each segment.</li>
                      <li>Exclude demographics with high spend but zero conversions.</li>
                    </ul>
                  </>
                }
              />
              <DemographicsChart
                title="Platform Breakdown"
                description="Impressions and reach by platform (Facebook, Instagram, etc.)."
                data={data.platforms}
                color="#f59e0b"
                barLabel="Impressions"
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>How your ad performance splits across Meta platforms — typically Facebook, Instagram, and Audience Network.</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <p>Each bar shows the number of impressions per platform. The relative size tells you where Meta is distributing your ads.</p>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Facebook vs Instagram ratio</strong> — Instagram typically delivers to younger audiences and performs better for visual/lifestyle brands. Facebook reaches a broader age range.</li>
                      <li><strong>Audience Network</strong> — These are ads shown on third-party apps. Often has lower quality traffic but cheaper CPMs.</li>
                      <li><strong>Performance differences</strong> — Use the Placement Breakdown table below for detailed per-platform metrics.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>If one platform outperforms, consider platform-specific campaigns with tailored creative.</li>
                      <li>Disable Audience Network if it drives impressions but no conversions.</li>
                      <li>Test Instagram Reels placement separately — it often delivers lower CPC.</li>
                    </ul>
                  </>
                }
              />
            </div>

            <FrequencyChart
              data={data.frequency}
              infoContent={
                <>
                  <p><strong>What am I looking at?</strong></p>
                  <p>How many times your audience has seen your ads, and the engagement at each frequency level. This measures ad fatigue.</p>

                  <p className="mt-3"><strong>How to read it</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Reach bars</strong> — How many people saw your ad that number of times.</li>
                    <li><strong>CTR line</strong> — Click-through rate at each frequency. Typically rises from frequency 1-3, then declines as fatigue sets in.</li>
                  </ul>

                  <p className="mt-3"><strong>What to look for</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>CTR declining after frequency 3-4</strong> — Normal and expected. This is the &quot;sweet spot&quot; before fatigue.</li>
                    <li><strong>High reach at frequency 10+</strong> — Your audience is too small or campaign has run too long. People are seeing your ad too many times.</li>
                    <li><strong>CTR still rising at frequency 5+</strong> — Rare but indicates strong creative that benefits from repetition.</li>
                  </ul>

                  <p className="mt-3"><strong>Actions you can take</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Set a frequency cap at the point where CTR starts declining (usually 3-5).</li>
                    <li>If average frequency is above 4, expand your audience or refresh creative.</li>
                    <li>Rotate new creatives every 2-3 weeks to prevent fatigue.</li>
                  </ul>
                </>
              }
            />

            <CampaignsTable
              data={data.campaigns}
              infoContent={
                <>
                  <p><strong>What am I looking at?</strong></p>
                  <p>A performance breakdown of each Meta Ads campaign. Shows spend, clicks, conversions, and efficiency metrics side by side.</p>

                  <p className="mt-3"><strong>How to read it</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Spend</strong> — Total budget consumed by each campaign.</li>
                    <li><strong>CTR</strong> — Click-through rate. Higher means more engaging ads.</li>
                    <li><strong>CPC</strong> — Cost per click. Lower is more efficient.</li>
                    <li><strong>Conversions</strong> — Lead actions (book_a_call, clicks) attributed to the campaign.</li>
                    <li><strong>CPA</strong> — Cost per acquisition. Your most important efficiency metric.</li>
                  </ul>

                  <p className="mt-3"><strong>What to look for</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>CPA comparison</strong> — Which campaigns deliver leads cheapest? Shift budget toward low-CPA campaigns.</li>
                    <li><strong>High spend, zero conversions</strong> — Stop or restructure these campaigns immediately.</li>
                    <li><strong>High CTR but low conversions</strong> — Ads attract clicks but the landing page doesn&apos;t convert. Review the post-click experience.</li>
                  </ul>

                  <p className="mt-3"><strong>Actions you can take</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Increase budget on campaigns with the lowest CPA and highest conversion volume.</li>
                    <li>Pause campaigns with CPA above your target (&euro;15.00).</li>
                    <li>A/B test landing pages for campaigns with high CTR but low conversion rate.</li>
                  </ul>
                </>
              }
            />

            {data.placements.length > 0 && (
              <PlacementTable
                data={data.placements}
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>Performance broken down by where your ads appear: Feed, Stories, Reels, Search Results, etc. on each platform (Facebook, Instagram).</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Platform</strong> — Which Meta platform (Facebook, Instagram).</li>
                      <li><strong>Placement</strong> — Where on that platform (Feed, Stories, Reels, etc.).</li>
                      <li><strong>CTR &amp; CPC</strong> — Efficiency metrics per placement. Different placements can have vastly different performance.</li>
                    </ul>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Reels vs Feed</strong> — Reels often delivers 2-3x CTR at lower CPC, but requires video creative.</li>
                      <li><strong>Stories performance</strong> — Full-screen vertical format often has high engagement but short viewing time.</li>
                      <li><strong>High spend on low-CTR placements</strong> — You may be overspending on placements that don&apos;t resonate.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Invest in video creative for Reels if it outperforms other placements.</li>
                      <li>Use placement-specific campaign structures for better control.</li>
                      <li>Exclude underperforming placements or reduce their bid adjustments.</li>
                    </ul>
                  </>
                }
              />
            )}

            <CreativesTable
              data={data.creatives}
              infoContent={
                <>
                  <p><strong>What am I looking at?</strong></p>
                  <p>Performance rankings for individual ad creatives, scored by a composite metric. Helps identify your best and worst performing ads.</p>

                  <p className="mt-3"><strong>How to read it</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Score</strong> — A composite ranking combining CTR, cost efficiency, and video performance. Higher is better.</li>
                    <li><strong>Thruplays</strong> — Video views where the user watched at least 15 seconds (or the full video if shorter). Measures genuine interest.</li>
                    <li><strong>Cost/Thruplay</strong> — How much you pay for each meaningful video view. Lower is better.</li>
                  </ul>

                  <p className="mt-3"><strong>What to look for</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Top scorers</strong> — These creatives resonate with your audience. Understand why — is it the message, visual style, format, or hook?</li>
                    <li><strong>Low score + high spend</strong> — You&apos;re spending money on underperforming creatives. Pause or replace them.</li>
                    <li><strong>Video views vs thruplays gap</strong> — A big gap means people start watching but don&apos;t stay. Your hook works but the content doesn&apos;t hold attention.</li>
                  </ul>

                  <p className="mt-3"><strong>Actions you can take</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Create variations of your top-scoring creatives (different hooks, same message).</li>
                    <li>Pause creatives with scores in the bottom 25% to stop wasting budget.</li>
                    <li>For video: focus on the first 3 seconds — that&apos;s where attention is won or lost.</li>
                  </ul>
                </>
              }
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
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
