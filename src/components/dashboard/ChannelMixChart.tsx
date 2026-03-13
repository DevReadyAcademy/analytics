"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";

interface ChannelRow {
  channel: string;
  sessions: number;
  users: number;
}

interface ChannelMixChartProps {
  data: ChannelRow[];
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
  "Unassigned": "#d1d5db",
};

function getColor(channel: string, index: number): string {
  return COLORS[channel] ?? ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#a855f7", "#06b6d4", "#9ca3af"][index % 7];
}

export default function ChannelMixChart({ data }: ChannelMixChartProps) {
  const totalSessions = data.reduce((s, r) => s + r.sessions, 0);

  const chartData = data.map((row) => ({
    name: row.channel,
    value: row.sessions,
    pct: totalSessions > 0 ? ((row.sessions / totalSessions) * 100).toFixed(1) : "0",
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Channel Attribution
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Where traffic comes from — organic vs paid vs direct. Guides budget allocation.
      </p>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={50}
              label={({ name, pct }) => `${name} (${pct}%)`}
              labelLine
            >
              {chartData.map((entry, i) => (
                <Cell key={entry.name} fill={getColor(entry.name, i)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => value.toLocaleString()}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
