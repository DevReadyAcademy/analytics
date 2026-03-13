"use client";

import { useEffect, useState, useCallback } from "react";
import { format, subDays } from "date-fns";
import MetricCard from "@/components/dashboard/MetricCard";
import TrafficChart from "@/components/dashboard/TrafficChart";
import CampaignsTable from "@/components/dashboard/CampaignsTable";
import CreativesTable from "@/components/dashboard/CreativesTable";
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
  };
  timeSeries: Array<{
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
  }>;
  campaigns: Array<{
    campaignName: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
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

    const params = new URLSearchParams({ startDate, endDate });

    try {
      const res = await fetch(`/api/meta-ads?${params}`);
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Spend"
                value={data.metrics.spend}
                format="currency"
              />
              <MetricCard
                title="Impressions"
                value={data.metrics.impressions}
              />
              <MetricCard title="Clicks" value={data.metrics.clicks} />
              <MetricCard title="Reach" value={data.metrics.reach} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="CTR"
                value={data.metrics.ctr}
                format="percent_raw"
              />
              <MetricCard
                title="CPC"
                value={data.metrics.cpc}
                format="currency"
              />
              <MetricCard
                title="CPM"
                value={data.metrics.cpm}
                format="currency"
              />
              <MetricCard
                title="Conversions"
                value={data.metrics.conversions}
              />
            </div>

            <TrafficChart
              title="Ad Spend & Clicks Over Time"
              data={data.timeSeries}
              lines={[
                { key: "clicks", label: "Clicks", color: "#6366f1" },
                { key: "spend", label: "Spend (\u20ac)", color: "#f43f5e" },
              ]}
            />

            <CampaignsTable data={data.campaigns} />

            <CreativesTable data={data.creatives} />
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
