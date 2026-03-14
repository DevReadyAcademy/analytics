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

interface ChannelRow {
  channel: string;
  sessions: number;
  users: number;
}

interface ChannelMixChartProps {
  data: ChannelRow[];
  infoContent?: React.ReactNode;
}

const COLORS: Record<string, string> = {
  "Paid Social": "#6366f1",
  "Paid Search": "#818cf8",
  "Organic Search": "#10b981",
  "Organic Social": "#34d399",
  Direct: "#9ca3af",
  Referral: "#a855f7",
  Email: "#f59e0b",
  Display: "#f43f5e",
  Unassigned: "#d1d5db",
};

const FALLBACK_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#a855f7", "#06b6d4", "#9ca3af"];

function getColor(channel: string, index: number): string {
  return COLORS[channel] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export default function ChannelMixChart({ data, infoContent }: ChannelMixChartProps) {
  const chartData = data.map((row) => ({
    channel: row.channel,
    sessions: row.sessions,
  }));

  return (
    <Card>
      <ChartHeader
        title="Channel Attribution"
        description="Where traffic comes from — organic vs paid vs direct. Guides budget allocation."
        infoContent={infoContent}
      />
      <div style={{ height: Math.max(chartData.length * 40, 200) }} className="mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="channel"
              tick={{ fontSize: 12 }}
              width={120}
              interval={0}
            />
            <Tooltip formatter={(value: number) => [value.toLocaleString(), "Sessions"]} />
            <Bar dataKey="sessions" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={entry.channel} fill={getColor(entry.channel, i)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
