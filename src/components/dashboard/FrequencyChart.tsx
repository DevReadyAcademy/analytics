"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";

interface FrequencyBucket {
  frequency: string;
  reach: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface FrequencyChartProps {
  data: FrequencyBucket[];
}

export default function FrequencyChart({ data }: FrequencyChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    ctrPct: Number(d.ctr),
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Frequency Distribution</h3>
      <p className="text-xs text-gray-500 mb-4">
        Reach per frequency bucket with CTR overlay — helps detect creative fatigue.
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="frequency" tick={{ fontSize: 12 }} label={{ value: "Times seen", position: "insideBottom", offset: -5, fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} unit="%" />
            <Tooltip
              formatter={(value: number, name: string) =>
                name === "CTR (%)" ? `${value.toFixed(2)}%` : value.toLocaleString()
              }
            />
            <Legend />
            <Bar yAxisId="left" dataKey="reach" name="Reach" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="ctrPct" name="CTR (%)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
