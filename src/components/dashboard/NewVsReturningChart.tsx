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

interface NewVsReturningRow {
  userType: string;
  users: number;
  sessions: number;
}

interface NewVsReturningChartProps {
  data: NewVsReturningRow[];
}

const COLORS: Record<string, string> = {
  new: "#6366f1",
  returning: "#10b981",
};

export default function NewVsReturningChart({ data }: NewVsReturningChartProps) {
  const totalUsers = data.reduce((s, r) => s + r.users, 0);

  const chartData = data.map((row) => ({
    name: row.userType === "new" ? "New Users" : "Returning Users",
    value: row.users,
    pct: totalUsers > 0 ? ((row.users / totalUsers) * 100).toFixed(1) : "0",
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        New vs Returning Users
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Acquisition vs retention balance. High new % = growth; high returning % = loyalty.
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              label={({ name, pct }) => `${name} (${pct}%)`}
              labelLine
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={i === 0 ? COLORS.new : COLORS.returning}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
