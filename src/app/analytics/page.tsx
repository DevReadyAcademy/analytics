"use client";

import { useEffect, useState, useCallback } from "react";
import { format, subDays, differenceInDays } from "date-fns";
import MetricCard from "@/components/dashboard/MetricCard";
import TrafficChart from "@/components/dashboard/TrafficChart";
import DemographicsChart from "@/components/dashboard/DemographicsChart";
import PagesTable from "@/components/dashboard/PagesTable";
import DateRangePicker from "@/components/dashboard/DateRangePicker";
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
  };
  previousMetrics: {
    totalUsers: number;
    sessions: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: number;
  } | null;
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                title="Bounce Rate"
                value={data.metrics.bounceRate}
                format="percent"
                previousValue={prev?.bounceRate}
                invertColor
              />
              <MetricCard
                title="Avg. Session Duration"
                value={data.metrics.avgSessionDuration}
                format="duration"
                previousValue={prev?.avgSessionDuration}
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

            {data.trafficSources.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DemographicsChart
                  title="Traffic Sources"
                  data={data.trafficSources}
                  color="#6366f1"
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
