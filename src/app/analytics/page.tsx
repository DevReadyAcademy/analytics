"use client";

import { useEffect, useState, useCallback } from "react";
import { format, subDays } from "date-fns";
import MetricCard from "@/components/dashboard/MetricCard";
import TrafficChart from "@/components/dashboard/TrafficChart";
import DemographicsChart from "@/components/dashboard/DemographicsChart";
import PagesTable from "@/components/dashboard/PagesTable";
import DateRangePicker from "@/components/dashboard/DateRangePicker";

interface GAData {
  metrics: {
    totalUsers: number;
    sessions: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
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

    const params = new URLSearchParams({ startDate, endDate });

    try {
      const res = await fetch(`/api/ga?${params}`);
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <MetricCard
                title="Total Users"
                value={data.metrics.totalUsers}
              />
              <MetricCard title="Sessions" value={data.metrics.sessions} />
              <MetricCard title="Pageviews" value={data.metrics.pageviews} />
              <MetricCard
                title="Bounce Rate"
                value={data.metrics.bounceRate}
                format="percent"
              />
              <MetricCard
                title="Avg. Session Duration"
                value={data.metrics.avgSessionDuration}
                format="duration"
              />
            </div>

            <TrafficChart
              title="Traffic Over Time"
              data={data.timeSeries}
              lines={[
                { key: "sessions", label: "Sessions", color: "#6366f1" },
                { key: "users", label: "Users", color: "#06b6d4" },
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DemographicsChart
                title="Top Countries"
                data={data.demographics.countries}
                color="#6366f1"
              />
              <DemographicsChart
                title="Top Cities"
                data={data.demographics.cities}
                color="#8b5cf6"
              />
              <DemographicsChart
                title="Devices"
                data={data.demographics.devices}
                color="#06b6d4"
              />
              <DemographicsChart
                title="Browsers"
                data={data.demographics.browsers}
                color="#10b981"
              />
            </div>

            <PagesTable
              title="Top Pages (GA4)"
              data={data.pages}
              variant="ga"
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
