"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Card from "@/components/ui/Card";
import ChartHeader from "@/components/ui/ChartHeader";

interface TargetComparisonChartProps {
  ctr: number;
  cpc: number;
  cpa: number;
  infoContent?: React.ReactNode;
}

export default function TargetComparisonChart({
  ctr,
  cpc,
  cpa,
  infoContent,
}: TargetComparisonChartProps) {
  const metrics = [
    {
      name: "CTR",
      value: Math.round((ctr / 3.0) * 100),
      actual: `${ctr.toFixed(2)}%`,
      target: "3.0%",
      status: ctr >= 3.0 ? "good" : ctr >= 2.5 ? "ok" : "bad",
    },
    {
      name: "CPC",
      value: Math.round((0.05 / Math.max(cpc, 0.001)) * 100),
      actual: `€${cpc.toFixed(3)}`,
      target: "€0.05",
      status: cpc <= 0.05 ? "good" : cpc <= 0.065 ? "ok" : "bad",
    },
    {
      name: "CPA",
      value: cpa > 0 ? Math.round((15 / cpa) * 100) : 0,
      actual: cpa > 0 ? `€${cpa.toFixed(2)}` : "N/A",
      target: "€15.00",
      status: cpa === 0 ? "neutral" : cpa <= 15 ? "good" : cpa <= 20 ? "ok" : "bad",
    },
  ];

  const getColor = (status: string) => {
    switch (status) {
      case "good": return "#22c55e";
      case "ok": return "#f59e0b";
      case "bad": return "#ef4444";
      default: return "#9ca3af";
    }
  };

  const getLabel = (status: string) => {
    switch (status) {
      case "good": return "Beating target";
      case "ok": return "Close to target";
      case "bad": return "Below target";
      default: return "No data";
    }
  };

  return (
    <Card>
      <ChartHeader
        title="Performance vs Targets"
        description="How your key metrics compare to benchmarks. 100% = hitting target."
        infoContent={infoContent}
      />
      <div className="h-64 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, (max: number) => Math.max(max, 120)]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 13, fontWeight: 600 }}
              tickLine={false}
              width={45}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: number, _name: string, props: any) => {
                const p = props?.payload;
                if (!p) return [String(value), ""];
                return [
                  `${value}% of target (${p.actual} vs ${p.target})`,
                  getLabel(p.status),
                ];
              }}
            />
            <ReferenceLine x={100} stroke="#6366f1" strokeDasharray="4 4" strokeWidth={2} label={{ value: "Target", position: "top", fontSize: 11, fill: "#6366f1" }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={32}>
              {metrics.map((entry, i) => (
                <Cell key={i} fill={getColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Beating target</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Close</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Below target</span>
      </div>
    </Card>
  );
}
