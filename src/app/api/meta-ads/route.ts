import { NextRequest, NextResponse } from "next/server";
import {
  getAdsOverview,
  getAdsTimeSeries,
  getCampaigns,
  getAdCreatives,
  getAgeGenderBreakdown,
  getPlatformBreakdown,
  getFrequencyDistribution,
} from "@/lib/meta-ads";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate") ?? "2024-01-01";
  const endDate =
    searchParams.get("endDate") ?? new Date().toISOString().split("T")[0];
  const compareStartDate = searchParams.get("compareStartDate");
  const compareEndDate = searchParams.get("compareEndDate");

  try {
    const [metrics, timeSeries, campaigns, creatives, ageGender, platforms, frequency] = await Promise.all([
      getAdsOverview(startDate, endDate),
      getAdsTimeSeries(startDate, endDate),
      getCampaigns(startDate, endDate),
      getAdCreatives(startDate, endDate),
      getAgeGenderBreakdown(startDate, endDate),
      getPlatformBreakdown(startDate, endDate),
      getFrequencyDistribution(startDate, endDate),
    ]);

    let previousMetrics = null;
    if (compareStartDate && compareEndDate) {
      previousMetrics = await getAdsOverview(compareStartDate, compareEndDate);
    }

    return NextResponse.json({
      metrics,
      previousMetrics,
      timeSeries,
      campaigns,
      creatives,
      ageGender,
      platforms,
      frequency,
    });
  } catch (error) {
    console.error("Meta Ads API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Meta Ads data" },
      { status: 500 }
    );
  }
}
