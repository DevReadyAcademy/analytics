"use client";

import Card from "@/components/ui/Card";
import ChartHeader from "@/components/ui/ChartHeader";

interface FunnelStage {
  stage: string;
  value: number;
}

interface FunnelChartProps {
  data: FunnelStage[];
  infoContent?: React.ReactNode;
}

export default function FunnelChart({ data, infoContent }: FunnelChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card>
      <ChartHeader
        title="Cross-Channel Funnel"
        description="Drop-off from ad impression to conversion. Numbers are directional (Meta + GA4 attribution may differ)."
        infoContent={infoContent}
      />
      <div className="space-y-3 mt-3">
        {data.map((stage, i) => {
          const widthPct = Math.max((stage.value / maxValue) * 100, 4);
          const prevValue = i > 0 ? data[i - 1].value : null;
          const dropRate =
            prevValue && prevValue > 0
              ? ((1 - stage.value / prevValue) * 100).toFixed(1)
              : null;

          return (
            <div key={stage.stage}>
              {dropRate && (
                <div className="text-xs text-gray-400 mb-1 ml-1">
                  {dropRate}% drop-off
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-36 text-sm text-gray-700 font-medium shrink-0">
                  {stage.stage}
                </div>
                <div className="flex-1 relative">
                  <div
                    className="h-8 rounded bg-indigo-500 flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${widthPct}%` }}
                  >
                    <span className="text-xs font-semibold text-white">
                      {stage.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
