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
    const attribution = await optional(
      "CRM attribution",
      getCampaignAttribution(startDate, endDate, campaigns),
      []
    );
    const attributionByName = new Map(attribution.map((row) => [row.campaignName, row]));
    const enrichedCampaigns = campaigns.map((campaign) => ({
      ...campaign,
      attribution: attributionByName.get(campaign.campaignName) ?? null,
    }));

    let previousMetrics = null;
    if (compareStartDate && compareEndDate) {
      previousMetrics = await getAdsOverview(compareStartDate, compareEndDate);
    }

    return NextResponse.json({
      metrics,
      previousMetrics,
      timeSeries,
      campaigns: enrichedCampaigns,
      attribution,
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
