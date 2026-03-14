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
import ChartHeader from "@/components/ui/ChartHeader";

interface NewVsReturningRow {
  userType: string;
  users: number;
  sessions: number;
}

interface NewVsReturningChartProps {
  data: NewVsReturningRow[];
  infoContent?: React.ReactNode;
}

const COLORS: Record<string, string> = {
  new: "#6366f1",
  returning: "#10b981",
};

export default function NewVsReturningChart({ data, infoContent }: NewVsReturningChartProps) {
  // Aggregate into exactly two buckets: "New Users" and "Returning Users"
  let newUsers = 0;
  let returningUsers = 0;
  for (const row of data) {
    if (row.userType === "new") {
      newUsers += row.users;
    } else {
      returningUsers += row.users;
    }
  }
  const totalUsers = newUsers + returningUsers;

  const chartData = [
    {
      name: "New Users",
      value: newUsers,
      pct: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(1) : "0",
    },
    {
      name: "Returning Users",
      value: returningUsers,
      pct: totalUsers > 0 ? ((returningUsers / totalUsers) * 100).toFixed(1) : "0",
    },
  ].filter((d) => d.value > 0);

  return (
    <Card>
      <ChartHeader
        title="New vs Returning Users"
        description="Acquisition vs retention balance. High new % = growth; high returning % = loyalty."
        infoContent={infoContent}
      />
      <div className="h-64 mt-3">
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
