import { NextRequest, NextResponse } from "next/server";
import { getAdsOverview, getAdsTimeSeries } from "@/lib/meta-ads";
import { getOverviewMetrics, getTimeSeries, getNewVsReturning, getChannelGrouping } from "@/lib/ga";
import { getSearchMetrics, getSearchTimeSeries } from "@/lib/search-console";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate") ?? "2024-01-01";
  const endDate =
    searchParams.get("endDate") ?? new Date().toISOString().split("T")[0];
  const compareStartDate = searchParams.get("compareStartDate");
  const compareEndDate = searchParams.get("compareEndDate");

  try {
    const [ads, ga, sc, adsTimeSeries, gaTimeSeries, scTimeSeries, newVsReturning, channelGrouping] = await Promise.all([
      getAdsOverview(startDate, endDate),
      getOverviewMetrics(startDate, endDate),
      getSearchMetrics(startDate, endDate),
      getAdsTimeSeries(startDate, endDate),
      getTimeSeries(startDate, endDate),
      getSearchTimeSeries(startDate, endDate),
      getNewVsReturning(startDate, endDate),
      getChannelGrouping(startDate, endDate),
    ]);

    let previousAds = null;
    let previousGa = null;
    let previousSc = null;
    if (compareStartDate && compareEndDate) {
      [previousAds, previousGa, previousSc] = await Promise.all([
        getAdsOverview(compareStartDate, compareEndDate),
        getOverviewMetrics(compareStartDate, compareEndDate),
        getSearchMetrics(compareStartDate, compareEndDate),
      ]);
    }

    const funnel = [
      { stage: "Ad Impressions", value: ads.impressions },
      { stage: "Link Clicks", value: ads.linkClicks },
      { stage: "Site Sessions", value: ga.sessions },
      { stage: "Engaged Sessions", value: ga.engagedSessions },
      { stage: "Conversions", value: ga.conversions },
    ];

    return NextResponse.json({
      ads,
      ga,
      sc,
      previousAds,
      previousGa,
      previousSc,
      adsTimeSeries,
      gaTimeSeries,
      scTimeSeries,
      newVsReturning,
      channelGrouping,
      funnel,
    });
  } catch (error) {
    console.error("Overview API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 }
    );
  }
}
