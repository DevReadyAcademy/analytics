import { NextRequest, NextResponse } from "next/server";
import {
  getOverviewMetrics,
  getTimeSeries,
  getDemographics,
  getTopPages,
  getTrafficSources,
  getLandingPages,
} from "@/lib/ga";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate") ?? "28daysAgo";
  const endDate = searchParams.get("endDate") ?? "today";
  const compareStartDate = searchParams.get("compareStartDate");
  const compareEndDate = searchParams.get("compareEndDate");

  try {
    const [metrics, timeSeries, countries, cities, devices, browsers, pages, trafficSources, landingPages] =
      await Promise.all([
        getOverviewMetrics(startDate, endDate),
        getTimeSeries(startDate, endDate),
        getDemographics(startDate, endDate, "country"),
        getDemographics(startDate, endDate, "city"),
        getDemographics(startDate, endDate, "deviceCategory"),
        getDemographics(startDate, endDate, "browser"),
        getTopPages(startDate, endDate),
        getTrafficSources(startDate, endDate),
        getLandingPages(startDate, endDate),
      ]);

    let previousMetrics = null;
    if (compareStartDate && compareEndDate) {
      previousMetrics = await getOverviewMetrics(compareStartDate, compareEndDate);
    }

    return NextResponse.json({
      metrics,
      previousMetrics,
      timeSeries,
      demographics: { countries, cities, devices, browsers },
      pages,
      trafficSources,
      landingPages,
    });
  } catch (error) {
    console.error("GA4 API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GA4 data" },
      { status: 500 }
    );
  }
}
