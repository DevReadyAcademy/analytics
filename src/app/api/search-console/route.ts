import { NextRequest, NextResponse } from "next/server";
import {
  getSearchMetrics,
  getSearchTimeSeries,
  getTopQueries,
  getTopSearchPages,
} from "@/lib/search-console";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate") ?? "2024-01-01";
  const endDate = searchParams.get("endDate") ?? new Date().toISOString().split("T")[0];

  try {
    const [metrics, timeSeries, queries, pages] = await Promise.all([
      getSearchMetrics(startDate, endDate),
      getSearchTimeSeries(startDate, endDate),
      getTopQueries(startDate, endDate),
      getTopSearchPages(startDate, endDate),
    ]);

    return NextResponse.json({
      metrics,
      timeSeries,
      queries,
      pages,
    });
  } catch (error) {
    console.error("Search Console API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Search Console data" },
      { status: 500 }
    );
  }
}
