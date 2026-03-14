"use client";

import { useEffect, useState, useCallback } from "react";
import { format, subDays, differenceInDays } from "date-fns";
import MetricCard from "@/components/dashboard/MetricCard";
import TrafficChart from "@/components/dashboard/TrafficChart";
import DemographicsChart from "@/components/dashboard/DemographicsChart";
import SearchQueriesTable from "@/components/dashboard/SearchQueriesTable";
import PagesTable from "@/components/dashboard/PagesTable";
import OpportunitiesTable from "@/components/dashboard/OpportunitiesTable";
import DateRangePicker from "@/components/dashboard/DateRangePicker";
import Card from "@/components/ui/Card";

interface SCData {
  metrics: {
    totalClicks: number;
    totalImpressions: number;
    averageCtr: number;
    averagePosition: number;
  };
  previousMetrics: {
    totalClicks: number;
    totalImpressions: number;
    averageCtr: number;
    averagePosition: number;
  } | null;
  timeSeries: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  queries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  pages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  devices: Array<{ dimension: string; sessions: number; users: number }>;
  countries: Array<{ dimension: string; sessions: number; users: number }>;
  opportunities: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    estimatedMissedClicks: number;
  }>;
  pageOpportunities: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    estimatedMissedClicks: number;
  }>;
}

export default function SearchConsolePage() {
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 28), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState<SCData | null>(null);
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
      const res = await fetch(`/api/search-console?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch Search Console data");
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
          Search Console
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Clicks"
                value={data.metrics.totalClicks}
                previousValue={prev?.totalClicks}
              />
              <MetricCard
                title="Total Impressions"
                value={data.metrics.totalImpressions}
                previousValue={prev?.totalImpressions}
              />
              <MetricCard
                title="Average CTR"
                value={data.metrics.averageCtr}
                format="percent"
                previousValue={prev?.averageCtr}
                target={0.03}
                targetLabel="3% target"
              />
              <MetricCard
                title="Average Position"
                value={data.metrics.averagePosition}
                format="decimal"
                previousValue={prev?.averagePosition}
                invertColor
              />
            </div>

            <TrafficChart
              title="Search Performance Over Time"
              description="Daily organic clicks and impressions. Tracks SEO momentum."
              data={data.timeSeries}
              lines={[
                { key: "clicks", label: "Clicks", color: "#6366f1" },
                { key: "impressions", label: "Impressions", color: "#f59e0b" },
              ]}
              infoContent={
                <>
                  <p><strong>What am I looking at?</strong></p>
                  <p>Daily organic search performance from Google Search Console: how many times your pages appeared in search results (impressions) and how many people clicked through (clicks).</p>

                  <p className="mt-3"><strong>How to read it</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Impressions (amber)</strong> — Number of times your site appeared in Google search results.</li>
                    <li><strong>Clicks (purple)</strong> — Number of times someone clicked on your result. The gap between impressions and clicks is your CTR opportunity.</li>
                  </ul>

                  <p className="mt-3"><strong>What to look for</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Impressions rising, clicks flat</strong> — You&apos;re ranking for more queries but titles/descriptions aren&apos;t compelling enough to click. Focus on meta tag optimization.</li>
                    <li><strong>Both declining</strong> — Possible ranking drops. Check for algorithm updates, technical issues, or competitors outranking you.</li>
                    <li><strong>Sudden impression spike</strong> — You may have started ranking for a high-volume keyword. Check the queries table to identify it.</li>
                  </ul>

                  <p className="mt-3"><strong>Actions you can take</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Improve CTR by writing compelling title tags and meta descriptions for high-impression pages.</li>
                    <li>If clicks are growing, ensure landing pages convert that organic traffic.</li>
                    <li>Correlate dips with Google algorithm update dates to understand ranking changes.</li>
                  </ul>
                </>
              }
            />

            {(data.devices.length > 0 || data.countries.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DemographicsChart
                  title="Search by Device"
                  description="Organic search clicks by device type."
                  data={data.devices}
                  color="#6366f1"
                  infoContent={
                    <>
                      <p><strong>What am I looking at?</strong></p>
                      <p>How your organic search traffic splits across device types: desktop, mobile, and tablet.</p>

                      <p className="mt-3"><strong>How to read it</strong></p>
                      <p>Each bar shows the number of organic clicks from that device type. Google uses mobile-first indexing, so mobile performance is critical for rankings.</p>

                      <p className="mt-3"><strong>What to look for</strong></p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong>Mobile dominance</strong> — If mobile drives most organic clicks, your site&apos;s mobile experience directly affects your search rankings.</li>
                        <li><strong>Desktop-heavy</strong> — Common for B2B services. Ensure your desktop experience is optimized for research-intent queries.</li>
                        <li><strong>Device-specific ranking differences</strong> — Google can rank pages differently on mobile vs desktop.</li>
                      </ul>

                      <p className="mt-3"><strong>Actions you can take</strong></p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Prioritize Core Web Vitals on the dominant device type.</li>
                        <li>Test your key pages on both mobile and desktop to ensure a good experience.</li>
                        <li>If mobile clicks are low despite high mobile search volume in your industry, investigate mobile page speed.</li>
                      </ul>
                    </>
                  }
                />
                <DemographicsChart
                  title="Search by Country"
                  description="Organic search clicks by country."
                  data={data.countries}
                  color="#10b981"
                  infoContent={
                    <>
                      <p><strong>What am I looking at?</strong></p>
                      <p>Organic search clicks broken down by the searcher&apos;s country. Shows where your SEO efforts have the most visibility.</p>

                      <p className="mt-3"><strong>How to read it</strong></p>
                      <p>Each bar represents organic clicks from one country. This differs from GA4 country data because it only counts search traffic, not all traffic.</p>

                      <p className="mt-3"><strong>What to look for</strong></p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong>Target market visibility</strong> — Are you getting organic clicks from the countries you serve?</li>
                        <li><strong>International SEO opportunities</strong> — High impressions from a country but low clicks may mean you rank but aren&apos;t compelling — localize content for that market.</li>
                        <li><strong>Language relevance</strong> — Clicks from non-English countries may indicate need for translated content.</li>
                      </ul>

                      <p className="mt-3"><strong>Actions you can take</strong></p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Create country-specific landing pages or content for high-potential markets.</li>
                        <li>Use hreflang tags if you serve multiple languages/regions.</li>
                        <li>Focus SEO content on keywords relevant to your top-traffic countries.</li>
                      </ul>
                    </>
                  }
                />
              </div>
            )}

            {data.opportunities.length > 0 && (
              <OpportunitiesTable
                data={data.opportunities}
                infoContent={
                  <>
                    <p><strong>What am I looking at?</strong></p>
                    <p>Keywords where you rank in the top 20 positions but have a CTR below 3%. These are &quot;low-hanging fruit&quot; — you already rank, but your search results aren&apos;t compelling enough to click.</p>

                    <p className="mt-3"><strong>How to read it</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Impressions</strong> — How often your page appears for this query. Higher = more potential traffic.</li>
                      <li><strong>CTR</strong> — Your click-through rate. Below 3% means most searchers skip your result.</li>
                      <li><strong>Position</strong> — Your average ranking. Position 1-3 should have 15-30% CTR; position 4-10 should have 3-10%.</li>
                      <li><strong>Est. Missed Clicks</strong> — Estimated additional clicks you&apos;d get if your CTR improved to the expected rate for your position.</li>
                    </ul>

                    <p className="mt-3"><strong>What to look for</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>High impressions + low CTR</strong> — Top priority. These keywords have the biggest click potential.</li>
                      <li><strong>Position 4-10</strong> — A small ranking improvement could double your CTR. Focus content optimization here.</li>
                    </ul>

                    <p className="mt-3"><strong>Actions you can take</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Rewrite title tags to be more compelling and include the exact search query.</li>
                      <li>Improve meta descriptions with clear value propositions and calls to action.</li>
                      <li>Add structured data (schema markup) to earn rich snippets that stand out in search results.</li>
                    </ul>
                  </>
                }
              />
            )}

            {data.pageOpportunities.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Page-Level SEO Opportunities
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Pages ranking in top 20 with high impressions but low CTR (&lt; 3%). Rewrite title tags and meta descriptions for these pages.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Page</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">Impressions</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">Clicks</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">CTR</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">Position</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">Est. Missed Clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pageOpportunities.map((row, i) => (
                        <tr
                          key={row.page}
                          className={`${i % 2 === 0 ? "bg-amber-50" : "bg-white"}`}
                        >
                          <td className="py-2 px-2 text-gray-900 max-w-xs truncate">{row.page}</td>
                          <td className="py-2 px-2 text-right text-gray-700">{row.impressions.toLocaleString()}</td>
                          <td className="py-2 px-2 text-right text-gray-700">{row.clicks.toLocaleString()}</td>
                          <td className="py-2 px-2 text-right text-gray-700">{(row.ctr * 100).toFixed(2)}%</td>
                          <td className="py-2 px-2 text-right text-gray-700">{row.position.toFixed(1)}</td>
                          <td className="py-2 px-2 text-right font-medium text-amber-700">{row.estimatedMissedClicks.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            <SearchQueriesTable
              data={data.queries}
              infoContent={
                <>
                  <p><strong>What am I looking at?</strong></p>
                  <p>The exact search queries people type into Google that lead them to your site. This reveals what your audience is actually looking for.</p>

                  <p className="mt-3"><strong>How to read it</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Query</strong> — The exact words typed into Google.</li>
                    <li><strong>Clicks</strong> — How many searchers clicked through to your site.</li>
                    <li><strong>Impressions</strong> — How many times your site appeared for this query.</li>
                    <li><strong>CTR</strong> — Clicks / Impressions. Are people choosing your result?</li>
                    <li><strong>Position</strong> — Your average ranking for this query (1 = top of page).</li>
                  </ul>

                  <p className="mt-3"><strong>What to look for</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Brand queries</strong> — Your company name should have high CTR. If not, competitors may be bidding on your brand terms.</li>
                    <li><strong>High-intent queries</strong> — Terms like &quot;buy&quot;, &quot;pricing&quot;, &quot;near me&quot; indicate purchase intent. Ensure these land on conversion-optimized pages.</li>
                    <li><strong>Unexpected queries</strong> — May reveal new content opportunities or audience needs you haven&apos;t addressed.</li>
                  </ul>

                  <p className="mt-3"><strong>Actions you can take</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Create dedicated content for high-impression queries you rank on page 2 for (position 11-20).</li>
                    <li>Ensure your top-clicked queries lead to relevant, conversion-optimized pages.</li>
                    <li>Use top queries as ad keywords in Google Ads for immediate visibility.</li>
                  </ul>
                </>
              }
            />

            <PagesTable
              title="Top Pages (Search Console)"
              data={data.pages}
              variant="search-console"
              infoContent={
                <>
                  <p><strong>What am I looking at?</strong></p>
                  <p>Your top-performing pages in organic search, ranked by clicks. Shows which pages drive the most organic traffic.</p>

                  <p className="mt-3"><strong>How to read it</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Clicks</strong> — Organic search visitors landing on this page.</li>
                    <li><strong>Impressions</strong> — How many times this page appeared in search results.</li>
                    <li><strong>CTR</strong> — Click-through rate for this page across all queries it ranks for.</li>
                  </ul>

                  <p className="mt-3"><strong>What to look for</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>High impressions, low clicks</strong> — The page ranks well but isn&apos;t attracting clicks. Improve its title tag and meta description.</li>
                    <li><strong>Top pages by clicks</strong> — These are your SEO workhorses. Protect them — don&apos;t change their URLs or remove content without redirects.</li>
                    <li><strong>Concentration</strong> — If one page drives &gt;50% of organic clicks, you&apos;re vulnerable. Diversify your SEO content.</li>
                  </ul>

                  <p className="mt-3"><strong>Actions you can take</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Add conversion CTAs to your top organic pages — they already get traffic, make them work harder.</li>
                    <li>Update and refresh content on top pages to maintain rankings.</li>
                    <li>Identify pages with declining clicks and investigate whether rankings dropped or search volume changed.</li>
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
