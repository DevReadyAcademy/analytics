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
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
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
              />
              <MetricCard
                title="CPC"
                value={data.metrics.cpc}
                format="currency"
                tooltip="Cost Per Click — average cost for each click on your ad"
                previousValue={prev?.cpc}
                invertColor
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
              data={data.timeSeries}
              lines={[
                { key: "clicks", label: "Clicks", color: "#6366f1" },
                { key: "spend", label: "Spend (\u20ac)", color: "#f43f5e" },
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AudienceBreakdownChart data={data.ageGender} />
              <DemographicsChart
                title="Platform Breakdown"
                data={data.platforms}
                color="#f59e0b"
              />
            </div>

            <FrequencyChart data={data.frequency} />

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
