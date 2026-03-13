import Card from "@/components/ui/Card";

interface Campaign {
  campaignName: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  cpa: number;
  roas?: number;
}

interface CampaignsTableProps {
  data: Campaign[];
}

export default function CampaignsTable({ data }: CampaignsTableProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Campaigns
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-500">
                Campaign
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                Spend
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                Impressions
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                Clicks
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                CTR
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                CPC
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                Conversions
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                CPA
              </th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">
                ROAS
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.campaignName}
                className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="py-2 px-2 text-gray-900 max-w-xs truncate">
                  {row.campaignName}
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  &euro;{row.spend.toFixed(2)}
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  {row.impressions.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  {row.clicks.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  {row.ctr.toFixed(2)}%
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  &euro;{row.cpc.toFixed(2)}
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  {row.conversions}
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  {row.cpa > 0 ? `\u20AC${row.cpa.toFixed(2)}` : "\u2014"}
                </td>
                <td className="py-2 px-2 text-right text-gray-700">
                  {row.roas && row.roas > 0 ? `${row.roas.toFixed(2)}x` : "\u2014"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="text-center py-8 text-gray-400">No campaign data available</p>
        )}
      </div>
    </Card>
  );
}
