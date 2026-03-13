"use client";

import { useEffect, useState, useCallback } from "react";
import { format, subDays } from "date-fns";
import MetricCard from "@/components/dashboard/MetricCard";
import TrafficChart from "@/components/dashboard/TrafficChart";
import DemographicsChart from "@/components/dashboard/DemographicsChart";
import SearchQueriesTable from "@/components/dashboard/SearchQueriesTable";
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

export default function Dashboard() {
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 28), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [gaData, setGaData] = useState<GAData | null>(null);
  const [scData, setScData] = useState<SCData | null>(null);
  const [gaLoading, setGaLoading] = useState(true);
  const [scLoading, setScLoading] = useState(true);
  const [gaError, setGaError] = useState<string | null>(null);
  const [scError, setScError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setGaLoading(true);
    setScLoading(true);
    setGaError(null);
    setScError(null);

    const params = new URLSearchParams({ startDate, endDate });

    const gaPromise = fetch(`/api/ga?${params}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch GA4 data");
        return res.json();
      })
      .then((data) => setGaData(data))
      .catch((err) => setGaError(err.message))
      .finally(() => setGaLoading(false));

    const scPromise = fetch(`/api/search-console?${params}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch Search Console data");
        return res.json();
      })
      .then((data) => setScData(data))
      .catch((err) => setScError(err.message))
      .finally(() => setScLoading(false));

    await Promise.all([gaPromise, scPromise]);
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
      {/* Date Range Picker */}
      <div className="flex items-center justify-between">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onRangeChange={handleRangeChange}
        />
      </div>

      {/* GA4 Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Google Analytics
        </h2>

        {gaError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
            {gaError}
          </div>
        )}

        {gaLoading ? (
          <LoadingPlaceholder />
        ) : gaData ? (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <MetricCard
                title="Total Users"
                value={gaData.metrics.totalUsers}
              />
              <MetricCard title="Sessions" value={gaData.metrics.sessions} />
              <MetricCard title="Pageviews" value={gaData.metrics.pageviews} />
              <MetricCard
                title="Bounce Rate"
                value={gaData.metrics.bounceRate}
                format="percent"
              />
              <MetricCard
                title="Avg. Session Duration"
                value={gaData.metrics.avgSessionDuration}
                format="duration"
              />
            </div>

            {/* Traffic Chart */}
            <TrafficChart
              title="Traffic Over Time"
              data={gaData.timeSeries}
              lines={[
                { key: "sessions", label: "Sessions", color: "#6366f1" },
                { key: "users", label: "Users", color: "#06b6d4" },
              ]}
            />

            {/* Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DemographicsChart
                title="Top Countries"
                data={gaData.demographics.countries}
                color="#6366f1"
              />
              <DemographicsChart
                title="Top Cities"
                data={gaData.demographics.cities}
                color="#8b5cf6"
              />
              <DemographicsChart
                title="Devices"
                data={gaData.demographics.devices}
                color="#06b6d4"
              />
              <DemographicsChart
                title="Browsers"
                data={gaData.demographics.browsers}
                color="#10b981"
              />
            </div>

            {/* Top Pages */}
            <PagesTable
              title="Top Pages (GA4)"
              data={gaData.pages}
              variant="ga"
            />
          </div>
        ) : null}
      </section>

      {/* Search Console Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Search Console
        </h2>

        {scError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
            {scError}
          </div>
        )}

        {scLoading ? (
          <LoadingPlaceholder />
        ) : scData ? (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Clicks"
                value={scData.metrics.totalClicks}
              />
              <MetricCard
                title="Total Impressions"
                value={scData.metrics.totalImpressions}
              />
              <MetricCard
                title="Average CTR"
                value={scData.metrics.averageCtr}
                format="percent"
              />
              <MetricCard
                title="Average Position"
                value={scData.metrics.averagePosition}
                format="decimal"
              />
            </div>

            {/* Search Performance Chart */}
            <TrafficChart
              title="Search Performance Over Time"
              data={scData.timeSeries}
              lines={[
                { key: "clicks", label: "Clicks", color: "#6366f1" },
                { key: "impressions", label: "Impressions", color: "#f59e0b" },
              ]}
            />

            {/* Top Queries */}
            <SearchQueriesTable data={scData.queries} />

            {/* Top Pages (Search Console) */}
            <PagesTable
              title="Top Pages (Search Console)"
              data={scData.pages}
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
