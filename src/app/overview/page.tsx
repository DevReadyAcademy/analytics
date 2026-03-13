"use client";

import { useEffect, useState, useCallback } from "react";
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
    revenue: number;
    roas: number;
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
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 28), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
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
              <MetricCard
                title="ROAS"
                value={data.ads.roas > 0 ? data.ads.roas.toFixed(2) + "x" : "N/A"}
                tooltip="Revenue / Ad Spend. Configure conversion values in Meta to activate."
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
                tooltip="% of sessions with a key event"
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
              <FunnelChart data={data.funnel} />
            )}

            {data.channelGrouping.length > 0 && (
              <ChannelMixChart data={data.channelGrouping} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TrafficChart
                title="Ad Spend & Clicks"
                data={data.adsTimeSeries}
                lines={[
                  { key: "clicks", label: "Clicks", color: "#6366f1" },
                  { key: "spend", label: "Spend (\u20ac)", color: "#f43f5e" },
                ]}
              />
              <TrafficChart
                title="Site Sessions & Users"
                data={data.gaTimeSeries}
                lines={[
                  { key: "sessions", label: "Sessions", color: "#6366f1" },
                  { key: "users", label: "Users", color: "#06b6d4" },
                ]}
              />
              <TrafficChart
                title="Organic Clicks & Impressions"
                data={data.scTimeSeries}
                lines={[
                  { key: "clicks", label: "Clicks", color: "#10b981" },
                  { key: "impressions", label: "Impressions", color: "#f59e0b" },
                ]}
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
