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

  // --- Composite performance score ---
  // Score = 0.30 × completionRate  (creative quality: thruplays / videoViews)
  //       + 0.25 × thruplayRate    (engagement: thruplays / impressions)
  //       + 0.25 × CTR             (action intent)
  //       + 0.20 × costEfficiency  (value: thruplays / spend)
  // Each component is min-max normalised across the result set (0–1).

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
