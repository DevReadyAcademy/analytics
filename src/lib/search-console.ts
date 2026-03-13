import { google } from "googleapis";
import path from "path";

const credentialsPath = path.join(process.cwd(), "credentials.json");

const auth = new google.auth.GoogleAuth({
  keyFile: credentialsPath,
  scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
});

const searchConsole = google.searchconsole({ version: "v1", auth });

const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL!;

export interface SCMetrics {
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
}

export interface SCTimeSeriesRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SCQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SCPageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export async function getSearchMetrics(
  startDate: string,
  endDate: string
): Promise<SCMetrics> {
  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: [],
    },
  });

  const rows = response.data.rows ?? [];
  if (rows.length === 0) {
    return {
      totalClicks: 0,
      totalImpressions: 0,
      averageCtr: 0,
      averagePosition: 0,
    };
  }

  const row = rows[0];
  return {
    totalClicks: row.clicks ?? 0,
    totalImpressions: row.impressions ?? 0,
    averageCtr: row.ctr ?? 0,
    averagePosition: row.position ?? 0,
  };
}

export async function getSearchTimeSeries(
  startDate: string,
  endDate: string
): Promise<SCTimeSeriesRow[]> {
  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["date"],
    },
  });

  return (
    response.data.rows?.map((row) => ({
      date: row.keys?.[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    })) ?? []
  );
}

export async function getTopQueries(
  startDate: string,
  endDate: string,
  limit = 20
): Promise<SCQueryRow[]> {
  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["query"],
      rowLimit: limit,
    },
  });

  return (
    response.data.rows?.map((row) => ({
      query: row.keys?.[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    })) ?? []
  );
}

export async function getTopSearchPages(
  startDate: string,
  endDate: string,
  limit = 20
): Promise<SCPageRow[]> {
  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit: limit,
    },
  });

  return (
    response.data.rows?.map((row) => ({
      page: row.keys?.[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    })) ?? []
  );
}
