"use client";

import { useEffect, useState, useCallback } from "react";
import { format, subDays, differenceInDays } from "date-fns";
import MetricCard from "@/components/dashboard/MetricCard";
import TrafficChart from "@/components/dashboard/TrafficChart";
import DemographicsChart from "@/components/dashboard/DemographicsChart";
import PagesTable from "@/components/dashboard/PagesTable";
import DateRangePicker from "@/components/dashboard/DateRangePicker";
import NewVsReturningChart from "@/components/dashboard/NewVsReturningChart";
import Card from "@/components/ui/Card";

interface GATrafficSourceRow {
  dimension: string;
  sessions: number;
  users: number;
  bounceRate: number;
}

interface GALandingPageRow {
  page: string;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface GAData {
  metrics: {
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
  previousMetrics: {
    totalUsers: number;
    sessions: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: number;
    engagementRate: number;
    engagedSessions: number;
    conversions: number;
    sessionConversionRate: number;
  } | null;
  newVsReturning: Array<{ userType: string; users: number; sessions: number }>;
  timeSeries: Array<{ date: string; sessions: number; users: number }>;
  demographics: {
    countries: Array<{ dimension: string; sessions: number; users: number }>;
    cities: Array<{ dimension: string; sessions: number; users: number }>;
    devices: Array<{ dimension: string; sessions: number; users: number }>;
    browsers: Array<{ dimension: string; sessions: number; users: number }>;
  };
  pages: Array<{
    page: string;
    pageviews: number;
    users: number;
    avgEngagementTime: number;
  }>;
  trafficSources: GATrafficSourceRow[];
  landingPages: GALandingPageRow[];
}

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 28), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState<GAData | null>(null);
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
      const res = await fetch(`/api/ga?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch GA4 data");
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Google Analytics
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Users"
                value={data.metrics.totalUsers}
                previousValue={prev?.totalUsers}
              />
              <MetricCard
                title="Sessions"
                value={data.metrics.sessions}
                previousValue={prev?.sessions}
              />
              <MetricCard
                title="Pageviews"
                value={data.metrics.pageviews}
                previousValue={prev?.pageviews}
              />
              <MetricCard
                title="Avg. Session Duration"
                value={data.metrics.avgSessionDuration}
                format="duration"
                previousValue={prev?.avgSessionDuration}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Engagement Rate"
                value={data.metrics.engagementRate}
                format="percent"
                tooltip="% of sessions lasting >10s, 2+ pageviews, or a conversion"
                previousValue={prev?.engagementRate}
                target={0.6}
                targetLabel="60% target"
              />
              <MetricCard
                title="Bounce Rate"
                value={data.metrics.bounceRate}
                format="percent"
                previousValue={prev?.bounceRate}
                invertColor
              />
              <MetricCard
                title="Conversions"
                value={data.metrics.conversions}
                tooltip="Key events: book_a_call, click"
                previousValue={prev?.conversions}
              />
              <MetricCard
                title="Conversion Rate"
                value={data.metrics.sessionConversionRate}
                format="percent"
                tooltip="% of sessions with book_a_call or click events"
                previousValue={prev?.sessionConversionRate}
                target={0.03}
                targetLabel="3% target"
              />
            </div>

            <TrafficChart
              title="Traffic Over Time"
              description="Daily sessions and unique users. Spot trends, seasonality, and campaign impact."
              data={data.timeSeries}
              lines={[
                { key: "sessions", label: "Sessions", color: "#6366f1" },
                { key: "users", label: "Users", color: "#06b6d4" },
              ]}
              infoContent={
                <>
                  <p><strong>What am I looking at?</strong></p>
                  <p>This chart plots two metrics over time from Google Analytics 4:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Sessions</strong> (purple) — The total number of visits to your site. A single user can have multiple sessions.</li>
                    <li><strong>Users</strong> (teal) — Unique visitors. If the same person visits 3 times, that&apos;s 3 sessions but 1 user.</li>
                  </ul>

                  <p><strong>How to read it</strong></p>
                  <p>The gap between the two lines shows how often users return. A narrow gap means mostly single-visit users (acquisition-heavy). A wide gap means users are coming back multiple times (retention-heavy).</p>

                  <p><strong>What to look for</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Upward trend</strong> — Growth is healthy. Check if it correlates with ad spend increases or organic/SEO wins.</li>
                    <li><strong>Sudden spikes</strong> — Often caused by a campaign launch, PR mention, or viral content. Check if the spike sustains or drops off.</li>
                    <li><strong>Declining trend</strong> — Investigate: did ad spend drop? Did a technical issue (site down, tracking broken) occur? Did rankings fall?</li>
                    <li><strong>Weekend dips</strong> — Normal for B2B/services. If your audience is consumers, flat weekends may signal a problem.</li>
                  </ul>

                  <p><strong>Actions you can take</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>If sessions are flat but ad spend is rising, your paid traffic efficiency is dropping — review campaigns.</li>
                    <li>If users grow but sessions don&apos;t, returning visits are declining — check email/retargeting.</li>
                    <li>Correlate peaks with your marketing calendar to understand what drives traffic.</li>
                  </ul>
                </>
              }
            />

            {data.trafficSources.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DemographicsChart
                  title="Traffic Sources"
                  description="Top source/medium combinations driving sessions to your site."
                  data={data.trafficSources}
                  color="#6366f1"
                  infoContent={
                    <>
                      <p><strong>What am I looking at?</strong></p>
                      <p>A horizontal bar chart showing the top source/medium combinations driving traffic to your site. &quot;Source&quot; is where the traffic comes from (google, facebook, direct), and &quot;medium&quot; identifies the type (organic, cpc, referral).</p>

                      <p className="mt-3"><strong>How to read it</strong></p>
                      <p>Each bar represents a traffic source. Longer bars mean more sessions from that source. The table to the right adds bounce rate context — a high-traffic source with a high bounce rate may be sending low-quality visitors.</p>

                      <p className="mt-3"><strong>What to look for</strong></p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong>Over-reliance on one source</strong> — If one source drives &gt;60% of traffic, you&apos;re vulnerable to algorithm changes or platform policy shifts.</li>
                        <li><strong>High sessions + high bounce rate</strong> — The source is sending visitors who don&apos;t engage. Check landing page relevance or ad targeting.</li>
                        <li><strong>Organic vs paid split</strong> — A healthy mix reduces dependency on ad spend. If organic is small, invest in SEO content.</li>
                      </ul>

                      <p className="mt-3"><strong>Actions you can take</strong></p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Diversify traffic sources if one dominates — don&apos;t put all eggs in one basket.</li>
                        <li>Investigate high-bounce sources: is the ad targeting right? Is the landing page relevant?</li>
                        <li>Double down on sources with low bounce rate and high session counts — they send quality traffic.</li>
                      </ul>
                    </>
                  }
                />
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources Detail</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-medium text-gray-500">Source / Medium</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-500">Sessions</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-500">Users</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-500">Bounce Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.trafficSources.map((row, i) => (
                          <tr key={row.dimension} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="py-2 px-2 text-gray-900 max-w-xs truncate">{row.dimension}</td>
                            <td className="py-2 px-2 text-right text-gray-700">{row.sessions.toLocaleString()}</td>
                            <td className="py-2 px-2 text-right text-gray-700">{row.users.toLocaleString()}</td>
                            <td className="py-2 px-2 text-right text-gray-700">{(row.bounceRate * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DemographicsChart
                title="Top Countries"
                description="Sessions by country. Guides geo-targeting and localization."
                data={data.demographics.countries}
                color="#6366f1"
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>Sessions broken down by the visitor&apos;s country. This data comes from Google Analytics IP-based geolocation.</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <p>Each bar represents a country. The longer the bar, the more sessions from that country.</p>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Target market alignment</strong> — Are most sessions coming from the countries you serve? If you serve Greece but most traffic is from the US, your targeting may be off.</li>
                      <li><strong>Unexpected countries</strong> — High traffic from countries you don&apos;t serve could indicate bot traffic or irrelevant ad targeting.</li>
                      <li><strong>Expansion opportunities</strong> — Significant organic traffic from a new country could signal demand worth exploring.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Adjust ad geo-targeting to focus spend on countries that convert.</li>
                      <li>If traffic from non-target countries is high, exclude those regions from ad campaigns to save budget.</li>
                      <li>Consider localization (language, currency) for high-traffic countries you&apos;re not yet serving.</li>
                    </ul>
                  </>
                }
              />
              <DemographicsChart
                title="Top Cities"
                description="Sessions by city. Identifies local market opportunities."
                data={data.demographics.cities}
                color="#8b5cf6"
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>Sessions broken down by city. Useful for businesses with a local or regional presence.</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <p>Each bar represents a city. Longer bars mean more sessions from that location.</p>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Local market strength</strong> — Are you getting traffic from the cities where your customers are?</li>
                      <li><strong>City concentration</strong> — If one city dominates, consider whether you&apos;re reaching a broad enough market.</li>
                      <li><strong>Ad campaign impact</strong> — Cities where you run local ads should show higher session counts.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Use city data to refine Meta Ads location targeting.</li>
                      <li>If a city has high traffic but low conversions, investigate landing page relevance for that locale.</li>
                      <li>Identify cities with growing traffic as potential markets for expansion.</li>
                    </ul>
                  </>
                }
              />
              <DemographicsChart
                title="Devices"
                description="Device split. Ensures mobile/desktop experience matches traffic."
                data={data.demographics.devices}
                color="#06b6d4"
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>How your visitors access your site: desktop, mobile, or tablet. This is critical for prioritizing your development and design efforts.</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <p>Each bar shows the number of sessions from that device type. Most services sites see 50-70% mobile traffic.</p>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Mobile vs desktop conversion gap</strong> — If mobile traffic is high but conversions are low on mobile, your mobile experience needs work.</li>
                      <li><strong>Ad platform alignment</strong> — Meta Ads are predominantly shown on mobile. If your site isn&apos;t mobile-optimized, you&apos;re wasting ad spend.</li>
                      <li><strong>Trends over time</strong> — Mobile share typically grows; if it&apos;s shrinking, check if mobile speed issues are driving users away.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Prioritize mobile UX testing if mobile sessions exceed 50%.</li>
                      <li>Check page load speed on mobile — slow pages kill mobile conversions.</li>
                      <li>Ensure forms and CTAs work smoothly on mobile devices.</li>
                    </ul>
                  </>
                }
              />
              <DemographicsChart
                title="Browsers"
                description="Browser distribution. Prioritize testing for top browsers."
                data={data.demographics.browsers}
                color="#10b981"
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>Which web browsers your visitors use. Helps prioritize cross-browser testing and identify potential compatibility issues.</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <p>Each bar shows sessions by browser. Chrome typically dominates at 60-70%, followed by Safari on Apple devices.</p>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Safari share</strong> — High Safari usage means many Apple/iOS users. Test your site on Safari regularly.</li>
                      <li><strong>Unusual patterns</strong> — High sessions from uncommon browsers could indicate bot traffic.</li>
                      <li><strong>Low session counts</strong> — If a browser has very few users, you may not need to prioritize testing for it.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Focus QA testing on the top 2-3 browsers shown here.</li>
                      <li>If you see high bounce rates for a specific browser, investigate rendering or JS compatibility issues.</li>
                    </ul>
                  </>
                }
              />
            </div>

            {data.landingPages.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Landing Pages</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Landing Page</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">Sessions</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">Bounce Rate</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">Avg. Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.landingPages.map((row, i) => {
                        const mins = Math.floor(row.avgSessionDuration / 60);
                        const secs = Math.round(row.avgSessionDuration % 60);
                        const duration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

                        return (
                          <tr key={row.page} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="py-2 px-2 text-gray-900 max-w-xs truncate">{row.page}</td>
                            <td className="py-2 px-2 text-right text-gray-700">{row.sessions.toLocaleString()}</td>
                            <td className="py-2 px-2 text-right text-gray-700">{(row.bounceRate * 100).toFixed(1)}%</td>
                            <td className="py-2 px-2 text-right text-gray-700">{duration}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {data.newVsReturning.length > 0 && (
              <NewVsReturningChart
                data={data.newVsReturning}
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>The split between first-time visitors (New) and people who have visited before (Returning). This is the single most important user segmentation per Lean Analytics.</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <p>The donut chart shows the proportion of new vs returning users. The percentages indicate what share of your audience is in each group.</p>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>&gt;80% new users</strong> — You&apos;re acquiring well but not retaining. Visitors come once and don&apos;t return. Focus on remarketing, email capture, and content that brings people back.</li>
                      <li><strong>&gt;50% returning users</strong> — Strong retention, but acquisition may be slowing. Check if you&apos;re reaching new audiences.</li>
                      <li><strong>Healthy balance</strong> — Typically 60-70% new, 30-40% returning indicates both acquisition and retention are working.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>If mostly new users: set up remarketing campaigns, email nurture sequences, and retargeting pixels.</li>
                      <li>If mostly returning: invest in top-of-funnel content, new ad audiences, and brand awareness campaigns.</li>
                      <li>Track this ratio over time — it reveals whether your growth strategy is balanced.</li>
                    </ul>
                  </>
                }
              />
            )}

            <PagesTable
              title="Top Pages (GA4)"
              data={data.pages}
              variant="ga"
              infoContent={
                <>
                  <p><strong>What am I looking at?</strong></p>
                  <p>Your most-viewed pages ranked by pageview count, along with unique users and average engagement time for each page.</p>

                  <p className="mt-3"><strong>How to read it</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Pageviews</strong> — Total times the page was loaded (includes repeat views by the same user).</li>
                    <li><strong>Users</strong> — Unique visitors who viewed this page.</li>
                    <li><strong>Avg. Time</strong> — How long users spend on this page. Longer time on content pages is good; long time on a checkout page may signal confusion.</li>
                  </ul>

                  <p className="mt-3"><strong>What to look for</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>High pageviews but low engagement time</strong> — Users land on the page but leave quickly. The content may not match their expectations.</li>
                    <li><strong>Key pages missing from top 10</strong> — If your pricing or contact page isn&apos;t here, users aren&apos;t finding it. Check navigation and CTAs.</li>
                    <li><strong>Blog vs service pages</strong> — If blog posts dominate but service pages are absent, your content may attract browsers rather than buyers.</li>
                  </ul>

                  <p className="mt-3"><strong>Actions you can take</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Add clear CTAs on your most-viewed pages to guide visitors toward conversion.</li>
                    <li>Improve internal linking from high-traffic pages to your key service/conversion pages.</li>
                    <li>Investigate pages with very low avg. time — they may need better content or a loading speed fix.</li>
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
