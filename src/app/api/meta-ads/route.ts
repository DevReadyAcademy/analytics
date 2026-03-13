import { NextRequest, NextResponse } from "next/server";
import {
  getAdsOverview,
  getAdsTimeSeries,
  getCampaigns,
} from "@/lib/meta-ads";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate") ?? "2024-01-01";
  const endDate =
    searchParams.get("endDate") ?? new Date().toISOString().split("T")[0];

  try {
    const [metrics, timeSeries, campaigns] = await Promise.all([
      getAdsOverview(startDate, endDate),
      getAdsTimeSeries(startDate, endDate),
      getCampaigns(startDate, endDate),
    ]);

    return NextResponse.json({
      metrics,
      timeSeries,
      campaigns,
    });
  } catch (error) {
    console.error("Meta Ads API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Meta Ads data" },
      { status: 500 }
    );
  }
}
