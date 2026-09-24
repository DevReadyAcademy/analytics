import { NextRequest, NextResponse } from "next/server";
import {
  getAdsOverview,
  getAdsTimeSeries,
  getCampaigns,
  getAdCreatives,
  getAgeGenderBreakdown,
  getPlatformBreakdown,
  getFrequencyDistribution,
  getPlacementBreakdown,
} from "@/lib/meta-ads";
import { getCampaignAttribution } from "@/lib/marketing-attribution";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate") ?? "2024-01-01";
  const endDate =
    searchParams.get("endDate") ?? new Date().toISOString().split("T")[0];
  const compareStartDate = searchParams.get("compareStartDate");
  const compareEndDate = searchParams.get("compareEndDate");

  try {
    const optional = async <T>(label: string, request: Promise<T>, fallback: T): Promise<T> => {
      try {
        return await request;
      } catch (error) {
        console.error(`Meta Ads ${label} request failed:`, error);
        return fallback;
      }
    };

    const [metrics, timeSeries, campaigns, creatives, ageGender, platforms, frequency, placements] = await Promise.all([
      getAdsOverview(startDate, endDate),
      getAdsTimeSeries(startDate, endDate),
      getCampaigns(startDate, endDate),
      optional("creative", getAdCreatives(startDate, endDate), []),
      optional("age/gender", getAgeGenderBreakdown(startDate, endDate), []),
      optional("platform", getPlatformBreakdown(startDate, endDate), []),
      optional("frequency", getFrequencyDistribution(startDate, endDate), []),
      optional("placement", getPlacementBreakdown(startDate, endDate), []),
    ]);
    let attribution: Awaited<ReturnType<typeof getCampaignAttribution>> = {
      campaigns: [],
      overall: { leads: 0, bookings: 0, paidCustomers: 0, deposits: 0, committedRevenue: 0 },
    };
    let attributionError: string | null = null;
    try {
      attribution = await getCampaignAttribution(startDate, endDate, campaigns);
    } catch (error) {
      attributionError = error instanceof Error ? error.message : "CRM attribution request failed";
      console.error("CRM attribution request failed:", error);
    }
    const attributionByName = new Map(attribution.campaigns.map((row) => [row.campaignName, row]));
    const enrichedCampaigns = campaigns.map((campaign) => ({
      ...campaign,
      attribution: attributionByName.get(campaign.campaignName) ?? null,
    }));
    const crmTotals = attribution.overall;

    let previousMetrics = null;
    if (compareStartDate && compareEndDate) {
      previousMetrics = await getAdsOverview(compareStartDate, compareEndDate);
    }

    return NextResponse.json({
      metrics: {
        ...metrics,
        crmLeads: crmTotals.leads,
        crmBookings: crmTotals.bookings,
        paidCustomers: crmTotals.paidCustomers,
        deposits: crmTotals.deposits,
        committedRevenue: crmTotals.committedRevenue,
        customerAcquisitionCost: crmTotals.paidCustomers > 0 ? metrics.spend / crmTotals.paidCustomers : 0,
      },
      previousMetrics,
      timeSeries,
      campaigns: enrichedCampaigns,
      attribution: attribution.campaigns,
      attributionError,
      creatives,
      ageGender,
      platforms,
      frequency,
      placements,
    });
  } catch (error) {
    console.error("Meta Ads API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Meta Ads data",
        details: error instanceof Error ? error.message : "Unknown Meta Ads error",
      },
      { status: 500 }
    );
  }
}
