"use client";

import Card from "@/components/ui/Card";
import ChartHeader from "@/components/ui/ChartHeader";
import { Fragment, useState } from "react";

interface Campaign {
  campaignId: string;
  campaignName: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  cpa: number;
  attribution?: {
    leads: number;
    bookings: number;
    customers: number;
    deposits: number;
    committedRevenue: number;
  } | null;
}

interface CampaignsTableProps {
  data: Campaign[];
  infoContent?: React.ReactNode;
}

export default function CampaignsTable({ data, infoContent }: CampaignsTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <Card>
      <ChartHeader title="Campaigns" infoContent={infoContent} />
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-500">Campaign</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Spend</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Impressions</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Clicks</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">CTR</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">CPC</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Meta actions</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Meta CPA</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">CRM leads</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Bookings</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Customers</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">CAC</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Committed ROAS</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <Fragment key={row.campaignName}>
              <tr key={row.campaignName} onClick={() => setExpanded(expanded === row.campaignName ? null : row.campaignName)} className={`${i % 2 === 0 ? "bg-gray-50" : "bg-white"} cursor-pointer hover:bg-indigo-50`}>
                <td className="py-2 px-2 text-gray-900 max-w-xs truncate"><span className="mr-2 text-gray-400">{expanded === row.campaignName ? "▾" : "▸"}</span>{row.campaignName}</td>
                <td className="py-2 px-2 text-right text-gray-700">&euro;{row.spend.toFixed(2)}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.impressions.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.clicks.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.ctr.toFixed(2)}%</td>
                <td className="py-2 px-2 text-right text-gray-700">&euro;{row.cpc.toFixed(2)}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.conversions}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.cpa > 0 ? `\u20AC${row.cpa.toFixed(2)}` : "\u2014"}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.attribution?.leads ?? "\u2014"}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.attribution?.bookings ?? "\u2014"}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.attribution?.customers ?? "\u2014"}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.attribution?.customers ? `\u20AC${(row.spend / row.attribution.customers).toFixed(2)}` : "\u2014"}</td>
                <td className="py-2 px-2 text-right text-gray-700">{row.attribution?.committedRevenue ? `${(row.attribution.committedRevenue / row.spend).toFixed(2)}x` : "\u2014"}</td>
              </tr>
              {expanded === row.campaignName && (
                <tr key={`${row.campaignName}-details`} className="bg-indigo-50/60">
                  <td colSpan={13} className="px-4 py-4 text-sm text-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div><span className="block text-xs text-gray-500">CRM leads</span><strong>{row.attribution?.leads ?? "—"}</strong></div>
                      <div><span className="block text-xs text-gray-500">Booked calls</span><strong>{row.attribution?.bookings ?? "—"}</strong></div>
                      <div><span className="block text-xs text-gray-500">Paid customers</span><strong>{row.attribution?.customers ?? "—"}</strong></div>
                      <div><span className="block text-xs text-gray-500">Deposits</span><strong>{row.attribution?.deposits ? `€${row.attribution.deposits.toFixed(2)}` : "—"}</strong></div>
                      <div><span className="block text-xs text-gray-500">Committed revenue</span><strong>{row.attribution?.committedRevenue ? `€${row.attribution.committedRevenue.toFixed(2)}` : "—"}</strong></div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">Click the row again to collapse. Attribution uses normalized CRM email/phone matching.</p>
                  </td>
                </tr>
              )}
              </Fragment>
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
