import { getCampaigns, type MetaAdsCampaign } from "@/lib/meta-ads";

const META_BASE_URL = "https://graph.facebook.com/v21.0";
const metaToken = process.env.META_ADS_ACCESS_TOKEN?.trim();
const pageId = process.env.META_ADS_PAGE_ID?.trim() || "859098210630697";
const lmsUrl = (process.env.LMS_API_URL || "").replace(/\/$/, "");
const lmsKey = process.env.LMS_API_KEY?.trim();

export interface CampaignAttribution {
  campaignId: string;
  campaignName: string;
  leads: number;
  bookings: number;
  customers: number;
  deposits: number;
  committedRevenue: number;
  matchedContacts: number;
  unattributedCustomers: number;
}

type Lead = { email: string; phone: string; createdTime: string; campaignId: string; campaignName: string };
type CrmUser = { email?: string; phone?: string; booking?: { scheduledAt?: string }; paymentSummary?: { amountPaid?: number }; };
type Enrollment = { user?: { email?: string }; totalAmount?: number; amountPaid?: number };
let leadsCache: { expires: number; value: Lead[] } | null = null;
let crmCache: { expires: number; value: { users: CrmUser[]; enrollments: Enrollment[] } } | null = null;
const CACHE_MS = 5 * 60 * 1000;

async function metaGet(path: string, params: Record<string, string>, token = metaToken) {
  if (!token) throw new Error("META_ADS_ACCESS_TOKEN is not configured");
  const url = new URL(`${META_BASE_URL}/${path}`);
  url.searchParams.set("access_token", token);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || `Meta API error (${response.status})`);
  return body;
}

async function allMeta(path: string, params: Record<string, string>, token = metaToken): Promise<any[]> {
  const first = await metaGet(path, params, token);
  const rows = [...(first.data || [])];
  let next = first.paging?.next;
  while (next) {
    const response = await fetch(next, { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message || `Meta API error (${response.status})`);
    rows.push(...(body.data || []));
    next = body.paging?.next;
  }
  return rows;
}

const emailKey = (value: unknown) => String(value || "").trim().toLowerCase();
const phoneKey = (value: unknown) => String(value || "").replace(/\D/g, "").replace(/^00/, "");

function extractLeadFields(fields: Array<{ name?: string; values?: string[] }> = []) {
  let email = "", phone = "";
  for (const field of fields) {
    const name = String(field.name || "").toLowerCase();
    const value = field.values?.[0] || "";
    if (!email && name.includes("email")) email = value;
    if (!phone && (name.includes("phone") || name.includes("τηλεφων"))) phone = value;
  }
  return { email, phone };
}

async function getMetaLeads(): Promise<Lead[]> {
  if (leadsCache && leadsCache.expires > Date.now()) return leadsCache.value;
  const campaigns = await allMeta(`act_${process.env.META_ADS_ACCOUNT_ID?.trim().replace(/^act_/i, "")}/campaigns`, {
    fields: "id,name,status,effective_status",
    limit: "100",
  });
  const formCampaigns = new Map<string, { id: string; name: string }[]>();
  await Promise.all(campaigns.map(async (campaign) => {
    const ads = await allMeta(`${campaign.id}/ads`, {
      fields: "id,name,creative{id,call_to_action}", limit: "100",
    });
    for (const ad of ads) {
      const formId = ad.creative?.call_to_action?.value?.lead_gen_form_id;
      if (!formId) continue;
      const linked = formCampaigns.get(formId) || [];
      linked.push({ id: campaign.id, name: campaign.name });
      formCampaigns.set(formId, linked);
    }
  }));
  const pages = await allMeta("me/accounts", { fields: "id,access_token", limit: "100" });
  const page = pages.find((item) => item.id === pageId);
  if (!page?.access_token) throw new Error("Could not obtain the Meta Page access token");
  const forms = await allMeta(`${pageId}/leadgen_forms`, { fields: "id", limit: "100" }, page.access_token);
  const leads: Lead[] = [];
  for (const form of forms) {
    const rows = await allMeta(`${form.id}/leads`, {
      fields: "created_time,field_data,campaign_id,campaign_name",
      limit: "100",
    }, page.access_token);
    for (const row of rows) {
      const fields = extractLeadFields(row.field_data);
      const linked = formCampaigns.get(form.id) || [];
      const campaign = linked.find((item) => item.id === row.campaign_id) || linked[0];
      leads.push({
        email: emailKey(fields.email), phone: phoneKey(fields.phone), createdTime: row.created_time,
        campaignId: row.campaign_id || campaign?.id || "unknown",
        campaignName: row.campaign_name || campaign?.name || "Unattributed Meta lead",
      });
    }
  }
  leadsCache = { expires: Date.now() + CACHE_MS, value: leads };
  return leads;
}

async function getCrmData() {
  if (crmCache && crmCache.expires > Date.now()) return crmCache.value;
  if (!lmsUrl || !lmsKey) throw new Error("CRM attribution is not configured: set LMS_API_URL and LMS_API_KEY");
  const headers = { "x-api-key": lmsKey };
  const [usersResponse, enrollmentsResponse] = await Promise.all([
    fetch(`${lmsUrl}/api/users?select=email,phone,booking,paymentSummary`, { headers, cache: "no-store" }),
    fetch(`${lmsUrl}/api/enrollments`, { headers, cache: "no-store" }),
  ]);
  if (!usersResponse.ok || !enrollmentsResponse.ok) {
    throw new Error(`CRM API request failed (${usersResponse.status}/${enrollmentsResponse.status}). Use LMS_API_URL=https://my.devready.gr, without a trailing /api.`);
  }
  const usersType = usersResponse.headers.get("content-type") || "";
  const enrollmentsType = enrollmentsResponse.headers.get("content-type") || "";
  if (!usersType.includes("application/json") || !enrollmentsType.includes("application/json")) {
    throw new Error("CRM API returned HTML instead of JSON. Set LMS_API_URL to https://my.devready.gr (not api.devready.gr) and redeploy.");
  }
  const value = {
    users: await usersResponse.json() as CrmUser[],
    enrollments: await enrollmentsResponse.json() as Enrollment[],
  };
  crmCache = { expires: Date.now() + CACHE_MS, value };
  return value;
}

export async function getCampaignAttribution(startDate: string, endDate: string, campaigns?: MetaAdsCampaign[]) {
  const [metaCampaigns, leads, crm] = await Promise.all([
    campaigns ? Promise.resolve(campaigns) : getCampaigns(startDate, endDate),
    getMetaLeads(),
    getCrmData(),
  ]);
  const leadByEmail = new Map<string, Lead>();
  const leadByPhone = new Map<string, Lead>();
  for (const lead of leads.sort((a, b) => a.createdTime.localeCompare(b.createdTime))) {
    if (lead.email && !leadByEmail.has(lead.email)) leadByEmail.set(lead.email, lead);
    if (lead.phone && !leadByPhone.has(lead.phone)) leadByPhone.set(lead.phone, lead);
  }
  const usersByEmail = new Map(crm.users.map((user) => [emailKey(user.email), user]));
  const usersByPhone = new Map(crm.users.map((user) => [phoneKey(user.phone), user]));
  const paidByEmail = new Map<string, { deposits: number; committed: number }>();
  for (const enrollment of crm.enrollments) {
    const email = emailKey(enrollment.user?.email);
    if (!email || Number(enrollment.amountPaid || 0) <= 0) continue;
    const current = paidByEmail.get(email) || { deposits: 0, committed: 0 };
    current.deposits += Number(enrollment.amountPaid || 0);
    current.committed += Number(enrollment.totalAmount || 0);
    paidByEmail.set(email, current);
  }
  const result = new Map<string, CampaignAttribution>();
  for (const campaign of metaCampaigns) {
    result.set(campaign.campaignName, { campaignId: campaign.campaignId, campaignName: campaign.campaignName, leads: 0, bookings: 0, customers: 0, deposits: 0, committedRevenue: 0, matchedContacts: 0, unattributedCustomers: 0 });
  }
  const seenBookings = new Set<string>();
  const seenCustomers = new Set<string>();
  for (const lead of leads) {
    const row = result.get(lead.campaignName) || { campaignId: lead.campaignId, campaignName: lead.campaignName, leads: 0, bookings: 0, customers: 0, deposits: 0, committedRevenue: 0, matchedContacts: 0, unattributedCustomers: 0 };
    row.leads += 1;
    const user = (lead.email && usersByEmail.get(lead.email)) || (lead.phone && usersByPhone.get(lead.phone));
    if (user) {
      row.matchedContacts += 1;
      const contactKey = emailKey(user.email) || phoneKey(user.phone);
      if (user.booking?.scheduledAt && !seenBookings.has(`${lead.campaignName}:${contactKey}`)) {
        row.bookings += 1;
        seenBookings.add(`${lead.campaignName}:${contactKey}`);
      }
      const paid = paidByEmail.get(emailKey(user.email));
      if (paid && !seenCustomers.has(`${lead.campaignName}:${contactKey}`)) {
        row.customers += 1;
        row.deposits += paid.deposits;
        row.committedRevenue += paid.committed;
        seenCustomers.add(`${lead.campaignName}:${contactKey}`);
      }
    }
    result.set(lead.campaignName, row);
  }
  return Array.from(result.values());
}
