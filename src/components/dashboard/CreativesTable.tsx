import Card from "@/components/ui/Card";

interface Creative {
  adName: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  videoViews: number;
  thruplays: number;
  costPerThruplay: number;
  score: number;
}

interface CreativesTableProps {
  data: Creative[];
}

export default function CreativesTable({ data }: CreativesTableProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Ad Creatives
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                Score
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-500">
                Ad Name
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                Spend
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                Video Views
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                Thruplays
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                Cost/Thruplay
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                CTR
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                Clicks
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.adName}
                className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="py-2 px-2 text-right font-medium text-gray-900">
                  {row.score}
                </td>
                <td className="py-2 px-2 text-gray-900 max-w-xs truncate">
                  {row.adName}
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  &euro;{row.spend.toFixed(2)}
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  {row.videoViews.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  {row.thruplays.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  &euro;{row.costPerThruplay.toFixed(2)}
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  {row.ctr.toFixed(2)}%
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  {row.clicks.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="text-center py-8 text-gray-400">No ad creative data available</p>
        )}
      </div>
    </Card>
  );
}