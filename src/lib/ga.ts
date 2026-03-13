import { BetaAnalyticsDataClient } from "@google-analytics/data";

const raw = JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}");
const credentials = {
  ...raw,
  private_key: raw.private_key?.replace(/\\n/g, "\n"),
};

const analyticsClient = new BetaAnalyticsDataClient({
  credentials,
});

const propertyId = process.env.GA4_PROPERTY_ID!;

export interface GAMetrics {
  totalUsers: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface GATimeSeriesRow {
  date: string;
  sessions: number;
  users: number;
}

export interface GADimensionRow {
  dimension: string;
  sessions: number;
  users: number;
}

export interface GAPageRow {
  page: string;
  pageviews: number;
  users: number;
  avgEngagementTime: number;
}

export interface GATrafficSourceRow {
  dimension: string;
  sessions: number;
  users: number;
  bounceRate: number;
}

export interface GALandingPageRow {
  page: string;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export async function getOverviewMetrics(
  startDate: string,
  endDate: string
): Promise<GAMetrics> {
  const [response] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "totalUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
    ],
  });

  const row = response.rows?.[0];
  return {
    totalUsers: Number(row?.metricValues?.[0]?.value ?? 0),
    sessions: Number(row?.metricValues?.[1]?.value ?? 0),
    pageviews: Number(row?.metricValues?.[2]?.value ?? 0),
    bounceRate: Number(row?.metricValues?.[3]?.value ?? 0),
    avgSessionDuration: Number(row?.metricValues?.[4]?.value ?? 0),
  };
}

export async function getTimeSeries(
  startDate: string,
  endDate: string
): Promise<GATimeSeriesRow[]> {
  const [response] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  return (
    response.rows?.map((row) => ({
      date: row.dimensionValues?.[0]?.value ?? "",
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      users: Number(row.metricValues?.[1]?.value ?? 0),
    })) ?? []
  );
}

export async function getDemographics(
  startDate: string,
  endDate: string,
  dimension: "country" | "city" | "deviceCategory" | "browser"
): Promise<GADimensionRow[]> {
  const [response] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: dimension }],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  });

  return (
    response.rows?.map((row) => ({
      dimension: row.dimensionValues?.[0]?.value ?? "(unknown)",
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      users: Number(row.metricValues?.[1]?.value ?? 0),
    })) ?? []
  );
}

export async function getTopPages(
  startDate: string,
  endDate: string
): Promise<GAPageRow[]> {
  const [response] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [
      { name: "screenPageViews" },
      { name: "totalUsers" },
      { name: "userEngagementDuration" },
    ],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 20,
  });

  return (
    response.rows?.map((row) => {
      const pageviews = Number(row.metricValues?.[0]?.value ?? 0);
      const users = Number(row.metricValues?.[1]?.value ?? 0);
      const totalEngagement = Number(row.metricValues?.[2]?.value ?? 0);
      return {
        page: row.dimensionValues?.[0]?.value ?? "",
        pageviews,
        users,
        avgEngagementTime: users > 0 ? totalEngagement / users : 0,
      };
    }) ?? []
  );
}

export async function getTrafficSources(
  startDate: string,
  endDate: string
): Promise<GATrafficSourceRow[]> {
  const [response] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "sessionSourceMedium" }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "bounceRate" },
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  });

  return (
    response.rows?.map((row) => ({
      dimension: row.dimensionValues?.[0]?.value ?? "(unknown)",
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      users: Number(row.metricValues?.[1]?.value ?? 0),
      bounceRate: Number(row.metricValues?.[2]?.value ?? 0),
    })) ?? []
  );
}

export async function getLandingPages(
  startDate: string,
  endDate: string
): Promise<GALandingPageRow[]> {
  const [response] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "landingPage" }],
    metrics: [
      { name: "sessions" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 20,
  });

  return (
    response.rows?.map((row) => ({
      page: row.dimensionValues?.[0]?.value ?? "",
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      bounceRate: Number(row.metricValues?.[1]?.value ?? 0),
      avgSessionDuration: Number(row.metricValues?.[2]?.value ?? 0),
    })) ?? []
  );
}
