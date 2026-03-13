const accessToken = process.env.META_ADS_ACCESS_TOKEN!;
const accountId = process.env.META_ADS_ACCOUNT_ID!;

const BASE_URL = "https://graph.facebook.com/v21.0";

export interface MetaAdsMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  reach: number;
  conversions: number;
}

export interface MetaAdsTimeSeriesRow {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
}

export interface MetaAdsCampaign {
  campaignName: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
}

async function fetchMetaAds(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("access_token", accessToken);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Meta Ads API error");
  }
  return response.json();
}

export async function getAdsOverview(
  startDate: string,
  endDate: string
): Promise<MetaAdsMetrics> {
  const data = await fetchMetaAds(`act_${accountId}/insights`, {
    fields:
      "spend,impressions,clicks,ctr,cpc,cpm,reach,actions",
    time_range: JSON.stringify({
      since: startDate,
      until: endDate,
    }),
  });

  const row = data.data?.[0];
  if (!row) {
    return {
      spend: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      reach: 0,
      conversions: 0,
    };
  }

  const conversions =
    row.actions?.find(
      (a: { action_type: string; value: string }) =>
        a.action_type === "offsite_conversion" ||
        a.action_type === "lead" ||
        a.action_type === "purchase"
    )?.value ?? 0;

  return {
    spend: Number(row.spend ?? 0),
    impressions: Number(row.impressions ?? 0),
    clicks: Number(row.clicks ?? 0),
    ctr: Number(row.ctr ?? 0),
    cpc: Number(row.cpc ?? 0),
    cpm: Number(row.cpm ?? 0),
    reach: Number(row.reach ?? 0),
    conversions: Number(conversions),
  };
}

export async function getAdsTimeSeries(
  startDate: string,
  endDate: string
): Promise<MetaAdsTimeSeriesRow[]> {
  const data = await fetchMetaAds(`act_${accountId}/insights`, {
    fields: "spend,impressions,clicks",
    time_range: JSON.stringify({
      since: startDate,
      until: endDate,
    }),
    time_increment: "1",
  });

  return (
    data.data?.map(
      (row: {
        date_start: string;
        spend: string;
        impressions: string;
        clicks: string;
      }) => ({
        date: row.date_start,
        spend: Number(row.spend ?? 0),
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
      })
    ) ?? []
  );
}

export async function getCampaigns(
  startDate: string,
  endDate: string
): Promise<MetaAdsCampaign[]> {
  const data = await fetchMetaAds(`act_${accountId}/insights`, {
    fields:
      "campaign_name,spend,impressions,clicks,ctr,cpc,actions",
    time_range: JSON.stringify({
      since: startDate,
      until: endDate,
    }),
    level: "campaign",
    limit: "20",
  });

  return (
    data.data?.map(
      (row: {
        campaign_name: string;
        spend: string;
        impressions: string;
        clicks: string;
        ctr: string;
        cpc: string;
        actions?: Array<{ action_type: string; value: string }>;
      }) => {
        const conversions =
          row.actions?.find(
            (a) =>
              a.action_type === "offsite_conversion" ||
              a.action_type === "lead" ||
              a.action_type === "purchase"
          )?.value ?? 0;

        return {
          campaignName: row.campaign_name,
          status: "active",
          spend: Number(row.spend ?? 0),
          impressions: Number(row.impressions ?? 0),
          clicks: Number(row.clicks ?? 0),
          ctr: Number(row.ctr ?? 0),
          cpc: Number(row.cpc ?? 0),
          conversions: Number(conversions),
        };
      }
    ) ?? []
  );
}
