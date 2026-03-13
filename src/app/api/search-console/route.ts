import { NextRequest, NextResponse } from "next/server";
import {
  getSearchMetrics,
  getSearchTimeSeries,
  getTopQueries,
  getTopSearchPages,
  getSearchByDevice,
  getSearchByCountry,
  getSEOOpportunities,
} from "@/lib/search-console";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate") ?? "2024-01-01";
  const endDate = searchParams.get("endDate") ?? new Date().toISOString().split("T")[0];
  const compareStartDate = searchParams.get("compareStartDate");
  const compareEndDate = searchParams.get("compareEndDate");

  try {
    const [metrics, timeSeries, queries, pages, devices, countries, opportunities] = await Promise.all([
      getSearchMetrics(startDate, endDate),
      getSearchTimeSeries(startDate, endDate),
      getTopQueries(startDate, endDate),
      getTopSearchPages(startDate, endDate),
      getSearchByDevice(startDate, endDate),
      getSearchByCountry(startDate, endDate),
      getSEOOpportunities(startDate, endDate),
    ]);

    let previousMetrics = null;
    if (compareStartDate && compareEndDate) {
      previousMetrics = await getSearchMetrics(compareStartDate, compareEndDate);
    }

    return NextResponse.json({
      metrics,
      previousMetrics,
      timeSeries,
      queries,
      pages,
      devices,
      countries,
      opportunities,
    });
  } catch (error) {
    console.error("Search Console API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Search Console data" },
      { status: 500 }
    );
  }
}
