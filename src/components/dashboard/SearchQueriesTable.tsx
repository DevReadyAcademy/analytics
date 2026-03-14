"use client";

import Card from "@/components/ui/Card";
import ChartHeader from "@/components/ui/ChartHeader";

interface Query {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchQueriesTableProps {
  data: Query[];
  infoContent?: React.ReactNode;
}

export default function SearchQueriesTable({ data, infoContent }: SearchQueriesTableProps) {
  return (
    <Card>
      <ChartHeader title="Top Search Queries" infoContent={infoContent} />
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-500">Query</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Clicks</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Impressions</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">CTR</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Position</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.query} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="py-2 px-2 text-gray-900 max-w-xs truncate">{row.query}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.clicks.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.impressions.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-gray-700">{(row.ctr * 100).toFixed(1)}%</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.position.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="text-center py-8 text-gray-400">No data available</p>
        )}
      </div>
    </Card>
  );
}
