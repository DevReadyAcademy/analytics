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
import ChartHeader from "@/components/ui/ChartHeader";
import { format, parse } from "date-fns";

interface TrafficChartProps {
  title: string;
  description?: string;
  infoContent?: React.ReactNode;
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
  description,
  infoContent,
  data,
  lines,
}: TrafficChartProps) {
  const formattedData = data.map((row) => ({
    ...row,
    dateLabel: formatDate(row.date),
  }));

  return (
    <Card>
      <ChartHeader title={title} description={description} infoContent={infoContent} />
      <div className="h-80 mt-3">
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
    if (dateStr.includes("-")) {
      return format(new Date(dateStr), "MMM d");
    }
    return format(parse(dateStr, "yyyyMMdd", new Date()), "MMM d");
  } catch {
    return dateStr;
  }
}
