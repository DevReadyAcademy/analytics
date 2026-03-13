import Card from "@/components/ui/Card";

interface PlacementRow {
  platform: string;
  placement: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
}

interface PlacementTableProps {
  data: PlacementRow[];
}

export default function PlacementTable({ data }: PlacementTableProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Ad Placement Breakdown
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Performance by placement (Feed, Stories, Reels, etc.). Guides creative production decisions.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-500">Platform</th>
              <th className="text-left py-3 px-2 font-medium text-gray-500">Placement</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Spend</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Impressions</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Clicks</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">CTR</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">CPC</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Conversions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={`${row.platform}-${row.placement}`}
                className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="py-2 px-2 text-gray-900 capitalize">{row.platform}</td>
                <td className="py-2 px-2 text-gray-700">{row.placement}</td>
                <td className="py-2 px-2 text-right text-gray-700">&euro;{row.spend.toFixed(2)}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.impressions.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.clicks.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.ctr.toFixed(2)}%</td>
                <td className="py-2 px-2 text-right text-gray-700">&euro;{row.cpc.toFixed(2)}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.conversions}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="text-center py-8 text-gray-400">No placement data available</p>
        )}
      </div>
    </Card>
  );
}
