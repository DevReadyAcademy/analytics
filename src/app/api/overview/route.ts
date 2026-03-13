import { NextRequest, NextResponse } from "next/server";
import { getAdsOverview } from "@/lib/meta-ads";
import { getOverviewMetrics } from "@/lib/ga";
import { getSearchMetrics } from "@/lib/search-console";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate") ?? "2024-01-01";
  const endDate =
    searchParams.get("endDate") ?? new Date().toISOString().split("T")[0];
  const compareStartDate = searchParams.get("compareStartDate");
  const compareEndDate = searchParams.get("compareEndDate");

  try {
    const [ads, ga, sc] = await Promise.all([
      getAdsOverview(startDate, endDate),
      getOverviewMetrics(startDate, endDate),
      getSearchMetrics(startDate, endDate),
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

    return NextResponse.json({
      ads,
      ga,
      sc,
      previousAds,
      previousGa,
      previousSc,
    });
  } catch (error) {
    console.error("Overview API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 }
    );
  }
}
