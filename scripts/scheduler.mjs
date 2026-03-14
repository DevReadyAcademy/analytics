/**
 * Lightweight alert scheduler — no dependencies required.
 *
 * Usage:
 *   node scripts/scheduler.mjs                          # default: http://localhost:3000
 *   node scripts/scheduler.mjs https://analytics.devready.gr   # production URL
 *
 * Keeps running in the background. Use pm2, screen, or nohup to persist.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SECRET = env.ALERTS_SECRET;
if (!SECRET) {
  console.error("ALERTS_SECRET not found in .env.local");
  process.exit(1);
}

const BASE_URL = process.argv[2] || "http://localhost:3000";

// --- Schedule config ---
const DAILY_HOUR = 8;
const DAILY_MINUTE = 0;
const WEEKLY_HOUR = 10;
const WEEKLY_MINUTE = 0;
const WEEKLY_DAY = 1; // Monday

// --- Helpers ---

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function runCheck(type) {
  const url = `${BASE_URL}/api/alerts/check?type=${type}`;
  log(`Running ${type} check → POST ${url}`);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${SECRET}` },
    });
    const body = await res.json();

    if (res.ok) {
      log(`${type}: ${body.triggered}/${body.checked} alerts triggered`);
      if (body.alerts?.length > 0) {
        body.alerts.forEach((a) => log(`  → ${a}`));
      }
    } else {
      log(`${type} failed (${res.status}): ${body.error || body.message}`);
    }
  } catch (err) {
    log(`${type} error: ${err.message}`);
  }
}

function msUntil(hour, minute) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target - now;
}

// --- Scheduler ---

let lastDailyRun = null;
let lastWeeklyRun = null;

function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

async function tick() {
  const now = new Date();
  const today = dateKey(now);
  const isMonday = now.getDay() === WEEKLY_DAY;

  // Weekly digest — Monday at 10:00
  if (
    isMonday &&
    now.getHours() === WEEKLY_HOUR &&
    now.getMinutes() >= WEEKLY_MINUTE &&
    lastWeeklyRun !== today
  ) {
    lastWeeklyRun = today;
    await runCheck("weekly");
  }

  // Daily checks — every day at 08:00
  if (
    now.getHours() === DAILY_HOUR &&
    now.getMinutes() >= DAILY_MINUTE &&
    lastDailyRun !== today
  ) {
    lastDailyRun = today;
    await runCheck("daily");
  }
}

// Check every 30 seconds
setInterval(tick, 30_000);

log("Scheduler started");
log(`  Base URL: ${BASE_URL}`);
log(`  Daily checks: every day at ${String(DAILY_HOUR).padStart(2, "0")}:${String(DAILY_MINUTE).padStart(2, "0")}`);
log(`  Weekly digest: Monday at ${String(WEEKLY_HOUR).padStart(2, "0")}:${String(WEEKLY_MINUTE).padStart(2, "0")}`);

const nextDaily = msUntil(DAILY_HOUR, DAILY_MINUTE);
const nextWeekly = (() => {
  const now = new Date();
  const daysUntilMonday = (WEEKLY_DAY - now.getDay() + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(next.getDate() + (now.getDay() === WEEKLY_DAY && now.getHours() < WEEKLY_HOUR ? 0 : daysUntilMonday));
  next.setHours(WEEKLY_HOUR, WEEKLY_MINUTE, 0, 0);
  return next;
})();

log(`  Next daily: ~${Math.round(nextDaily / 60000)} min`);
log(`  Next weekly: ${nextWeekly.toLocaleString()}`);

// Run initial tick
tick();
