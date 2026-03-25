"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import Card from "@/components/ui/Card";
import ChartHeader from "@/components/ui/ChartHeader";

interface BudgetUtilizationChartProps {
  data: Array<{ date: string; spend: number }>;
  dailyBudget: number;
  infoContent?: React.ReactNode;
}

export default function BudgetUtilizationChart({
  data,
  dailyBudget,
  infoContent,
}: BudgetUtilizationChartProps) {
  const chartData = data.map((row) => ({
    ...row,
    dateLabel: formatDate(row.date),
    budget: dailyBudget,
  }));

  const totalSpend = data.reduce((sum, r) => sum + r.spend, 0);
  const totalBudget = data.length * dailyBudget;
  const utilizationPct = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;
  const avgDaily = data.length > 0 ? totalSpend / data.length : 0;

  return (
    <Card>
      <ChartHeader
        title="Budget Utilization"
        description={`€${dailyBudget}/day budget. ${utilizationPct.toFixed(0)}% utilized (avg €${avgDaily.toFixed(2)}/day).`}
        infoContent={infoContent}
      />
      <div className="h-72 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 5, right: 20 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(v) => `€${v}`}
              domain={[0, (max: number) => Math.max(max, dailyBudget * 1.2)]}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "Daily Spend") {
                  const pct = dailyBudget > 0 ? ((value / dailyBudget) * 100).toFixed(0) : "0";
                  return [`€${value.toFixed(2)} (${pct}% of budget)`, name];
                }
                return [`€${value.toFixed(2)}`, name];
              }}
            />
            <ReferenceLine
              y={dailyBudget}
              stroke="#ef4444"
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{
                value: `€${dailyBudget} budget`,
                position: "right",
                fontSize: 11,
                fill: "#ef4444",
              }}
            />
            <Area
              type="monotone"
              dataKey="spend"
              name="Daily Spend"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#spendGradient)"
              dot={{ r: 3, fill: "#6366f1" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "MMM d");
  } catch {
    return dateStr;
  }
}
