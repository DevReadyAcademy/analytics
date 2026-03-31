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
  linkClicks: number;
  landingPageViews: number;
  frequency: number;
  cpa: number;
  costPerLinkClick: number;
}

export interface MetaAdsTimeSeriesRow {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  cpm: number;
}

export interface MetaAdsCreative {
  adName: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  videoViews: number;
  thruplays: number;
  costPerThruplay: number;
  score: number;
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
  cpa: number;
}

export interface PlacementRow {
  platform: string;
  placement: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
}

export interface AgeGenderRow {
  age: string;
  gender: string;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
}

export interface PlatformRow {
  dimension: string;
  sessions: number;
  users: number;
}

export interface FrequencyBucket {
  frequency: string;
  reach: number;
  impressions: number;
  clicks: number;
  ctr: number;
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

const conversionTypes = [
  "offsite_conversion.fb_pixel_custom",
  "lead",
  "offsite_conversion.fb_pixel_lead",
];

function extractConversions(actions: Array<{ action_type: string; value: string }> | undefined): number {
  return (actions ?? [])
    .filter((a) =>
      conversionTypes.some(
        (t) => a.action_type === t || a.action_type.startsWith(`${t}.`)
      )
    )
    .reduce((sum, a) => sum + Number(a.value ?? 0), 0);
}

function extractLinkClicks(actions: Array<{ action_type: string; value: string }> | undefined): number {
  return Number(
    actions?.find((a) => a.action_type === "link_click")?.value ?? 0
  );
}

function extractLandingPageViews(actions: Array<{ action_type: string; value: string }> | undefined): number {
  return Number(
    actions?.find((a) => a.action_type === "landing_page_view")?.value ?? 0
  );
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
      linkClicks: 0,
      landingPageViews: 0,
      frequency: 0,
      cpa: 0,
      costPerLinkClick: 0,
    };
  }

  const conversions = extractConversions(row.actions);
  const linkClicks = extractLinkClicks(row.actions);
  const landingPageViews = extractLandingPageViews(row.actions);
  const spend = Number(row.spend ?? 0);

  return {
    spend,
    impressions: Number(row.impressions ?? 0),
    clicks: Number(row.clicks ?? 0),
    ctr: Number(row.ctr ?? 0),
    cpc: Number(row.cpc ?? 0),
    cpm: Number(row.cpm ?? 0),
    reach: Number(row.reach ?? 0),
    conversions,
    linkClicks,
    landingPageViews,
    frequency: Number(row.reach ?? 0) > 0
      ? Number(row.impressions ?? 0) / Number(row.reach ?? 1)
      : 0,
    cpa: conversions > 0 ? spend / conversions : 0,
    costPerLinkClick: linkClicks > 0 ? spend / linkClicks : 0,
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
      }) => {
        const spend = Number(row.spend ?? 0);
        const impressions = Number(row.impressions ?? 0);
        const clicks = Number(row.clicks ?? 0);
        return {
          date: row.date_start,
          spend,
          impressions,
          clicks,
          cpc: clicks > 0 ? spend / clicks : 0,
          cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
        };
      }
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
        const conversions = extractConversions(row.actions);
        const spend = Number(row.spend ?? 0);

        return {
          campaignName: row.campaign_name,
          status: "active",
          spend,
          impressions: Number(row.impressions ?? 0),
          clicks: Number(row.clicks ?? 0),
          ctr: Number(row.ctr ?? 0),
          cpc: Number(row.cpc ?? 0),
          conversions,
          cpa: conversions > 0 ? spend / conversions : 0,
        };
      }
    ) ?? []
  );
}

export async function getAdCreatives(
  startDate: string,
  endDate: string
): Promise<MetaAdsCreative[]> {
  const data = await fetchMetaAds(`act_${accountId}/insights`, {
    fields:
      "ad_name,spend,impressions,clicks,ctr,video_play_actions,video_thruplay_watched_actions,cost_per_thruplay,actions",
    time_range: JSON.stringify({
      since: startDate,
      until: endDate,
    }),
    level: "ad",
    limit: "20",
  });

  const parsed: Omit<MetaAdsCreative, "score">[] = (
    data.data?.map(
      (row: {
        ad_name: string;
        spend: string;
        impressions: string;
        clicks: string;
        ctr: string;
        video_play_actions?: Array<{ action_type: string; value: string }>;
        video_thruplay_watched_actions?: Array<{ action_type: string; value: string }>;
        cost_per_thruplay?: Array<{ action_type: string; value: string }>;
      }) => {
        const videoViews = Number(
          row.video_play_actions?.find((a) => a.action_type === "video_view")
            ?.value ?? 0
        );
        const thruplays = Number(
          row.video_thruplay_watched_actions?.find(
            (a) => a.action_type === "video_view"
          )?.value ?? 0
        );
        const costPerThruplay = Number(
          row.cost_per_thruplay?.find((a) => a.action_type === "video_view")
            ?.value ?? 0
        );

        return {
          adName: row.ad_name,
          spend: Number(row.spend ?? 0),
          impressions: Number(row.impressions ?? 0),
          clicks: Number(row.clicks ?? 0),
          ctr: Number(row.ctr ?? 0),
          videoViews,
          thruplays,
          costPerThruplay,
        };
      }
    ) ?? []
  );

  const W_COMPLETION = 0.30;
  const W_THRUPLAY_RATE = 0.25;
  const W_CTR = 0.25;
  const W_COST_EFF = 0.20;

  const raw = parsed.map((r) => ({
    completionRate: r.videoViews > 0 ? r.thruplays / r.videoViews : 0,
    thruplayRate: r.impressions > 0 ? r.thruplays / r.impressions : 0,
    ctr: r.ctr,
    costEfficiency: r.spend > 0 ? r.thruplays / r.spend : 0,
  }));

  const minMax = (vals: number[]) => {
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min;
    return vals.map((v) => (range > 0 ? (v - min) / range : 0));
  };

  const nCompletion = minMax(raw.map((r) => r.completionRate));
  const nThruplayRate = minMax(raw.map((r) => r.thruplayRate));
  const nCtr = minMax(raw.map((r) => r.ctr));
  const nCostEff = minMax(raw.map((r) => r.costEfficiency));

  const rows: MetaAdsCreative[] = parsed.map((r, i) => ({
    ...r,
    score: Math.round(
      (W_COMPLETION * nCompletion[i] +
        W_THRUPLAY_RATE * nThruplayRate[i] +
        W_CTR * nCtr[i] +
        W_COST_EFF * nCostEff[i]) *
        100
    ),
  }));

  rows.sort((a, b) => b.score - a.score);
  return rows;
}

export async function getAgeGenderBreakdown(
  startDate: string,
  endDate: string
): Promise<AgeGenderRow[]> {
  const data = await fetchMetaAds(`act_${accountId}/insights`, {
    fields: "spend,impressions,clicks,reach",
    time_range: JSON.stringify({ since: startDate, until: endDate }),
    breakdowns: "age,gender",
    limit: "50",
  });

  return (
    data.data?.map(
      (row: {
        age: string;
        gender: string;
        spend: string;
        impressions: string;
        clicks: string;
        reach: string;
      }) => ({
        age: row.age,
        gender: row.gender,
        spend: Number(row.spend ?? 0),
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
        reach: Number(row.reach ?? 0),
      })
    ) ?? []
  );
}

export async function getPlatformBreakdown(
  startDate: string,
  endDate: string
): Promise<PlatformRow[]> {
  const data = await fetchMetaAds(`act_${accountId}/insights`, {
    fields: "spend,impressions,clicks,reach",
    time_range: JSON.stringify({ since: startDate, until: endDate }),
    breakdowns: "publisher_platform",
    limit: "10",
  });

  return (
    data.data?.map(
      (row: {
        publisher_platform: string;
        impressions: string;
        reach: string;
      }) => ({
        dimension: row.publisher_platform,
        sessions: Number(row.impressions ?? 0),
        users: Number(row.reach ?? 0),
      })
    ) ?? []
  );
}

export async function getFrequencyDistribution(
  startDate: string,
  endDate: string
): Promise<FrequencyBucket[]> {
  const data = await fetchMetaAds(`act_${accountId}/insights`, {
    fields: "reach,impressions,clicks,ctr",
    time_range: JSON.stringify({ since: startDate, until: endDate }),
    breakdowns: "frequency_value",
    limit: "20",
  });

  return (
    data.data?.map(
      (row: {
        frequency_value: string;
        reach: string;
        impressions: string;
        clicks: string;
        ctr: string;
      }) => ({
        frequency: row.frequency_value,
        reach: Number(row.reach ?? 0),
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
        ctr: Number(row.ctr ?? 0),
      })
    ) ?? []
  );
}

export async function getPlacementBreakdown(
  startDate: string,
  endDate: string
): Promise<PlacementRow[]> {
  const data = await fetchMetaAds(`act_${accountId}/insights`, {
    fields: "spend,impressions,clicks,ctr,cpc,actions",
    time_range: JSON.stringify({ since: startDate, until: endDate }),
    breakdowns: "publisher_platform,platform_position",
    limit: "30",
  });

  return (
    data.data?.map(
      (row: {
        publisher_platform: string;
        platform_position: string;
        spend: string;
        impressions: string;
        clicks: string;
        ctr: string;
        cpc: string;
        actions?: Array<{ action_type: string; value: string }>;
      }) => ({
        platform: row.publisher_platform,
        placement: row.platform_position,
        spend: Number(row.spend ?? 0),
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
        ctr: Number(row.ctr ?? 0),
        cpc: Number(row.cpc ?? 0),
        conversions: extractConversions(row.actions),
      })
    ) ?? []
  );
}
