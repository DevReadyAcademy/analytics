"use client";

import { useEffect, useState, useCallback } from "react";
import { format, subDays } from "date-fns";
import MetricCard from "@/components/dashboard/MetricCard";
import TrafficChart from "@/components/dashboard/TrafficChart";
import SearchQueriesTable from "@/components/dashboard/SearchQueriesTable";
import PagesTable from "@/components/dashboard/PagesTable";
import DateRangePicker from "@/components/dashboard/DateRangePicker";

interface SCData {
  metrics: {
    totalClicks: number;
    totalImpressions: number;
    averageCtr: number;
    averagePosition: number;
  };
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

    const params = new URLSearchParams({ startDate, endDate });

    try {
      const res = await fetch(`/api/search-console?${params}`);
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
              />
              <MetricCard
                title="Total Impressions"
                value={data.metrics.totalImpressions}
              />
              <MetricCard
                title="Average CTR"
                value={data.metrics.averageCtr}
                format="percent"
              />
              <MetricCard
                title="Average Position"
                value={data.metrics.averagePosition}
                format="decimal"
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
