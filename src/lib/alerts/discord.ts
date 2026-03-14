export interface DiscordEmbedField {
  name: string;
  value: string;
  inline: boolean;
}

export interface AlertResult {
  title: string;
  description: string;
  color: number;
  fields: DiscordEmbedField[];
}

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  url: string;
  fields: DiscordEmbedField[];
  footer: { text: string };
  timestamp: string;
}

export async function sendToDiscord(alerts: AlertResult[]): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_PULSE_URL;
  if (!webhookUrl) {
    throw new Error("DISCORD_WEBHOOK_PULSE_URL is not configured");
  }

  const DASHBOARD_URL = "https://analytics-eight-steel.vercel.app/overview";

  const embeds: DiscordEmbed[] = alerts.map((alert) => ({
    title: alert.title,
    description: alert.description,
    color: alert.color,
    url: DASHBOARD_URL,
    fields: alert.fields,
    footer: { text: "devready.gr Analytics" },
    timestamp: new Date().toISOString(),
  }));

  // Discord allows max 10 embeds per message
  for (let i = 0; i < embeds.length; i += 10) {
    const batch = embeds.slice(i, i + 10);
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: batch }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Discord webhook failed (${response.status}): ${text}`);
    }
  }
}
