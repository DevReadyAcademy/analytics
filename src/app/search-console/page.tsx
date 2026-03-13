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
              data={data.timeSeries}
              lines={[
                { key: "clicks", label: "Clicks", color: "#6366f1" },
                { key: "impressions", label: "Impressions", color: "#f59e0b" },
              ]}
            />

            {(data.devices.length > 0 || data.countries.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DemographicsChart
                  title="Search by Device"
                  data={data.devices}
                  color="#6366f1"
                />
                <DemographicsChart
                  title="Search by Country"
                  data={data.countries}
                  color="#10b981"
                />
              </div>
            )}

            {data.opportunities.length > 0 && (
              <OpportunitiesTable data={data.opportunities} />
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

            <SearchQueriesTable data={data.queries} />

            <PagesTable
              title="Top Pages (Search Console)"
              data={data.pages}
              variant="search-console"
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
