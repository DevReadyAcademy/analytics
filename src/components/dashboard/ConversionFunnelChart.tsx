"use client";

import Card from "@/components/ui/Card";
import ChartHeader from "@/components/ui/ChartHeader";

interface ConversionFunnelChartProps {
  impressions: number;
  clicks: number;
  linkClicks: number;
  landingPageViews: number;
  conversions: number;
  infoContent?: React.ReactNode;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface FunnelStep {
  label: string;
  value: number;
  color: string;
}

export default function ConversionFunnelChart({
  impressions,
  clicks,
  linkClicks,
  landingPageViews,
  conversions,
  infoContent,
}: ConversionFunnelChartProps) {
  const steps: FunnelStep[] = [
    { label: "Impressions", value: impressions, color: "#6366f1" },
    { label: "Clicks", value: clicks, color: "#8b5cf6" },
    { label: "Link Clicks", value: linkClicks, color: "#a855f7" },
    { label: "Landing Page Views", value: landingPageViews, color: "#c084fc" },
    { label: "Conversions", value: conversions, color: "#22c55e" },
  ];

  const maxValue = Math.max(...steps.map((s) => s.value), 1);

  return (
    <Card>
      <ChartHeader
        title="Conversion Funnel"
        description="Where people drop off from seeing your ad to booking a call."
        infoContent={infoContent}
      />
      <div className="mt-4 space-y-3">
        {steps.map((step, i) => {
          const widthPct = Math.max((step.value / maxValue) * 100, 2);
          const dropoff = i > 0 && steps[i - 1].value > 0
            ? ((1 - step.value / steps[i - 1].value) * 100).toFixed(1)
            : null;

          return (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{step.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{formatNumber(step.value)}</span>
                  {dropoff && (
                    <span className="text-xs text-red-500">-{dropoff}%</span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: step.color,
                  }}
                >
                  {widthPct > 15 && (
                    <span className="text-xs font-medium text-white">
                      {i > 0 ? `${((step.value / steps[0].value) * 100).toFixed(1)}%` : "100%"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {impressions > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <span className="text-sm text-gray-500">
            Overall conversion rate:{" "}
            <span className="font-bold text-gray-900">
              {impressions > 0 ? ((conversions / impressions) * 100).toFixed(3) : "0"}%
            </span>
            {" "}of impressions → bookings
          </span>
        </div>
      )}
    </Card>
  );
}
