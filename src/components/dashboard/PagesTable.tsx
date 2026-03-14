"use client";

import Card from "@/components/ui/Card";
import ChartHeader from "@/components/ui/ChartHeader";

interface Page {
  page: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
  pageviews?: number;
  users?: number;
  avgEngagementTime?: number;
}

interface PagesTableProps {
  title: string;
  data: Page[];
  variant: "ga" | "search-console";
  infoContent?: React.ReactNode;
}

export default function PagesTable({ title, data, variant, infoContent }: PagesTableProps) {
  return (
    <Card>
      <ChartHeader title={title} infoContent={infoContent} />
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-500">Page</th>
              {variant === "ga" ? (
                <>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Pageviews</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Users</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Avg. Time</th>
                </>
              ) : (
                <>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Clicks</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Impressions</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">CTR</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.page} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="py-2 px-2 text-gray-900 max-w-xs truncate" title={row.page}>{row.page}</td>
                {variant === "ga" ? (
                  <>
                    <td className="py-2 px-2 text-right text-gray-700">{row.pageviews?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{row.users?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{formatDuration(row.avgEngagementTime ?? 0)}</td>
                  </>
                ) : (
                  <>
                    <td className="py-2 px-2 text-right text-gray-700">{row.clicks?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{row.impressions?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{((row.ctr ?? 0) * 100).toFixed(1)}%</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
          {data.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">No data available</td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </Card>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}
