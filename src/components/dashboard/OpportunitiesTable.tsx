import Card from "@/components/ui/Card";

interface Opportunity {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  estimatedMissedClicks: number;
}

interface OpportunitiesTableProps {
  data: Opportunity[];
}

export default function OpportunitiesTable({ data }: OpportunitiesTableProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        SEO Opportunities
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Keywords you rank for (position &le; 20) with high impressions but low CTR (&lt; 3%). Improve title tags and meta descriptions.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-500">Query</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Impressions</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Clicks</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">CTR</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Position</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Est. Missed Clicks</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.query}
                className={`${i % 2 === 0 ? "bg-amber-50" : "bg-white"}`}
              >
                <td className="py-2 px-2 text-gray-900 max-w-xs truncate">{row.query}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.impressions.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.clicks.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-gray-700">{(row.ctr * 100).toFixed(2)}%</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.position.toFixed(1)}</td>
                <td className="py-2 px-2 text-right font-medium text-amber-700">{row.estimatedMissedClicks.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="text-center py-8 text-gray-400">No SEO opportunities found for this period</p>
        )}
      </div>
    </Card>
  );
}
