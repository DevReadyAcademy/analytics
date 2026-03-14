"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import ChartHeader from "@/components/ui/ChartHeader";

interface AgeGenderRow {
  age: string;
  gender: string;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
}

interface AudienceBreakdownChartProps {
  data: AgeGenderRow[];
  infoContent?: React.ReactNode;
}

export default function AudienceBreakdownChart({ data, infoContent }: AudienceBreakdownChartProps) {
  const grouped: Record<string, { age: string; male: number; female: number; unknown: number }> = {};

  for (const row of data) {
    if (!grouped[row.age]) {
      grouped[row.age] = { age: row.age, male: 0, female: 0, unknown: 0 };
    }
    if (row.gender === "male") {
      grouped[row.age].male += row.reach;
    } else if (row.gender === "female") {
      grouped[row.age].female += row.reach;
    } else {
      grouped[row.age].unknown += row.reach;
    }
  }

  const chartData = Object.values(grouped).sort((a, b) =>
    a.age.localeCompare(b.age)
  );

  return (
    <Card>
      <ChartHeader
        title="Audience by Age & Gender"
        description="Reach distribution across age groups. Informs targeting and creative decisions."
        infoContent={infoContent}
      />
      <div className="h-72 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="age" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            <Bar dataKey="male" name="Male" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
            <Bar dataKey="female" name="Female" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
