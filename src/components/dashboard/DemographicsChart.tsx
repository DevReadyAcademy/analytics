"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import ChartHeader from "@/components/ui/ChartHeader";

interface DemographicsChartProps {
  title: string;
  description?: string;
  infoContent?: React.ReactNode;
  data: Array<{
    dimension: string;
    sessions: number;
    users: number;
  }>;
  color?: string;
  barLabel?: string;
}

export default function DemographicsChart({
  title,
  description,
  infoContent,
  data,
  color = "#6366f1",
  barLabel = "Sessions",
}: DemographicsChartProps) {
  const labelWidth = Math.min(
    Math.max(...data.map((d) => d.dimension.length), 0) * 7 + 10,
    160
  );

  return (
    <Card>
      <ChartHeader title={title} description={description} infoContent={infoContent} />
      <div style={{ height: Math.max(data.length * 32, 200) }} className="mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="dimension"
              tick={{ fontSize: 11 }}
              width={labelWidth}
              interval={0}
            />
            <Tooltip />
            <Bar dataKey="sessions" name={barLabel} fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
