"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Card from "@/components/ui/Card";
import ChartHeader from "@/components/ui/ChartHeader";

interface Creative {
  adName: string;
  score: number;
  spend: number;
  ctr: number;
  costPerThruplay: number;
}

interface CreativeRankingChartProps {
  data: Creative[];
  infoContent?: React.ReactNode;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 50) return "#6366f1";
  if (score >= 30) return "#f59e0b";
  return "#ef4444";
}

export default function CreativeRankingChart({
  data,
  infoContent,
}: CreativeRankingChartProps) {
  const sorted = [...data].sort((a, b) => b.score - a.score);

  const chartData = sorted.map((c) => ({
    name: truncate(c.adName, 25),
    fullName: c.adName,
    score: c.score,
    spend: c.spend,
    ctr: c.ctr,
    costPerThruplay: c.costPerThruplay,
  }));

  return (
    <Card>
      <ChartHeader
        title="Ad Creative Rankings"
        description="Composite score: 30% completion rate, 25% thruplay rate, 25% CTR, 20% cost efficiency."
        infoContent={infoContent}
      />
      <div style={{ height: Math.max(chartData.length * 36 + 40, 200) }} className="mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              width={160}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(_value: number, _name: string, props: any) => {
                const p = props?.payload;
                if (!p) return [String(_value), ""];
                return [
                  `Score: ${p.score}/100 | Spend: €${p.spend.toFixed(2)} | CTR: ${p.ctr.toFixed(2)}% | Cost/Thruplay: €${p.costPerThruplay.toFixed(3)}`,
                  p.fullName,
                ];
              }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getScoreColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Top (70+)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Good (50-69)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Average (30-49)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Poor (&lt;30)</span>
      </div>
    </Card>
  );
}
