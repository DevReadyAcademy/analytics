import { NextRequest, NextResponse } from "next/server";
import {
  getOverviewMetrics,
  getTimeSeries,
  getDemographics,
  getTopPages,
} from "@/lib/ga";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate") ?? "28daysAgo";
  const endDate = searchParams.get("endDate") ?? "today";

  try {
    const [metrics, timeSeries, countries, cities, devices, browsers, pages] =
      await Promise.all([
        getOverviewMetrics(startDate, endDate),
        getTimeSeries(startDate, endDate),
        getDemographics(startDate, endDate, "country"),
        getDemographics(startDate, endDate, "city"),
        getDemographics(startDate, endDate, "deviceCategory"),
        getDemographics(startDate, endDate, "browser"),
        getTopPages(startDate, endDate),
      ]);

    return NextResponse.json({
      metrics,
      timeSeries,
      demographics: { countries, cities, devices, browsers },
      pages,
    });
  } catch (error) {
    console.error("GA4 API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GA4 data" },
      { status: 500 }
    );
  }
}
