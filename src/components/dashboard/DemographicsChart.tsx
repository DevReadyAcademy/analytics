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

interface DemographicsChartProps {
  title: string;
  data: Array<{
    dimension: string;
    sessions: number;
    users: number;
  }>;
  color?: string;
}

export default function DemographicsChart({
  title,
  data,
  color = "#6366f1",
}: DemographicsChartProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="dimension"
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip />
            <Bar dataKey="sessions" name="Sessions" fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
