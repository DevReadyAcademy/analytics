"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import { format, parse } from "date-fns";

interface TrafficChartProps {
  title: string;
  data: Array<{
    date: string;
    [key: string]: string | number;
  }>;
  lines: Array<{
    key: string;
    label: string;
    color: string;
  }>;
}

export default function TrafficChart({
  title,
  data,
  lines,
}: TrafficChartProps) {
  const formattedData = data.map((row) => ({
    ...row,
    dateLabel: formatDate(row.date),
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} />
            <Tooltip />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function formatDate(dateStr: string): string {
  try {
    // GA4 returns YYYYMMDD, Search Console returns YYYY-MM-DD
    if (dateStr.includes("-")) {
      return format(new Date(dateStr), "MMM d");
    }
    return format(parse(dateStr, "yyyyMMdd", new Date()), "MMM d");
  } catch {
    return dateStr;
  }
}
