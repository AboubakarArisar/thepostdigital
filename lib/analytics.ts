import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const bundledDataPath = path.join(process.cwd(), "data");
const runtimeDataPath =
  process.env.DATA_DIR ||
  (process.env.VERCEL ? path.join("/tmp", "newsclient-data") : bundledDataPath);
const storePath = path.join(runtimeDataPath, "analytics.json");
const cloudinaryAnalyticsPublicId =
  process.env.CLOUDINARY_ANALYTICS_PUBLIC_ID || "newsclient/analytics.json";

// Keep at most this many days of per-day history in the store.
const MAX_HISTORY_DAYS = 60;

export type AnalyticsStore = {
  totalViews: number;
  uniqueVisitors: number;
  daily: Record<string, number>;
};

export type AnalyticsSummary = {
  totalViews: number;
  uniqueVisitors: number;
  todayViews: number;
  last7: { date: string; count: number }[];
};

// Bucket views by the Pakistani calendar day (Asia/Karachi), so "today" rolls
// over at local midnight rather than at UTC midnight (5am PKT).
const karachiDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Karachi",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dayKey(date: Date) {
  // en-CA formats as YYYY-MM-DD.
  return karachiDayFormatter.format(date);
}

function lastNDays(count: number) {
  const days: string[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Pakistan does not observe DST, so stepping back in fixed 24h increments and
  // formatting each instant in Karachi time yields the correct calendar days.
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    days.push(dayKey(new Date(now - offset * dayMs)));
  }

  return days;
}

// Vercel's /tmp is ephemeral and not shared across serverless instances, so the
// local file alone loses analytics between cold starts. When Cloudinary is
// configured we persist the store there (same durable store the articles use).
function hasCloudinaryStore() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

function normalizeStore(parsed: Partial<AnalyticsStore> | null): AnalyticsStore {
  return {
    totalViews: parsed?.totalViews ?? 0,
    uniqueVisitors: parsed?.uniqueVisitors ?? 0,
    daily: parsed?.daily ?? {},
  };
}

async function readCloudinaryStore(): Promise<AnalyticsStore | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;

  const response = await fetch(
    `https://res.cloudinary.com/${cloudName}/raw/upload/${cloudinaryAnalyticsPublicId}?_=${Date.now()}`,
    { cache: "no-store" },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Cloudinary analytics store returned HTTP ${response.status}.`);
  }

  return normalizeStore((await response.json()) as Partial<AnalyticsStore>);
}

async function writeCloudinaryStore(store: AnalyticsStore) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary analytics store is missing required credentials.");
  }

  const timestamp = Math.round(Date.now() / 1000).toString();
  const params = {
    invalidate: "true",
    overwrite: "true",
    public_id: cloudinaryAnalyticsPublicId,
    timestamp,
  };
  const form = new FormData();
  const json = JSON.stringify(store, null, 2);

  form.append("file", new Blob([json], { type: "application/json" }), "analytics.json");
  form.append("api_key", apiKey);
  form.append("invalidate", params.invalidate);
  form.append("overwrite", params.overwrite);
  form.append("public_id", params.public_id);
  form.append("timestamp", timestamp);
  form.append("signature", signCloudinaryParams(params, apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
    {
      method: "POST",
      body: form,
    },
  );

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;

    throw new Error(
      result?.error?.message ||
        `Cloudinary analytics store upload failed with HTTP ${response.status}.`,
    );
  }
}

async function readLocalStore(): Promise<AnalyticsStore> {
  try {
    const parsed = JSON.parse(
      await readFile(storePath, "utf8"),
    ) as Partial<AnalyticsStore>;
    return normalizeStore(parsed);
  } catch {
    return normalizeStore(null);
  }
}

async function writeLocalStore(store: AnalyticsStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

async function readStore(): Promise<AnalyticsStore> {
  if (hasCloudinaryStore()) {
    const cloudStore = await readCloudinaryStore();
    if (cloudStore) {
      // Keep the local /tmp copy warm as a cache.
      await writeLocalStore(cloudStore).catch(() => {});
      return cloudStore;
    }
  }

  return readLocalStore();
}

async function writeStore(store: AnalyticsStore) {
  if (hasCloudinaryStore()) {
    await writeCloudinaryStore(store);
  }

  await writeLocalStore(store);
}

export async function recordVisit({ isNewVisitor }: { isNewVisitor: boolean }) {
  const store = await readStore();
  const today = dayKey(new Date());

  store.totalViews += 1;
  store.daily[today] = (store.daily[today] ?? 0) + 1;
  if (isNewVisitor) store.uniqueVisitors += 1;

  const keptDays = Object.keys(store.daily).sort();
  if (keptDays.length > MAX_HISTORY_DAYS) {
    for (const day of keptDays.slice(0, keptDays.length - MAX_HISTORY_DAYS)) {
      delete store.daily[day];
    }
  }

  await writeStore(store);
  return store;
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const store = await readStore();
  const today = dayKey(new Date());

  return {
    totalViews: store.totalViews,
    uniqueVisitors: store.uniqueVisitors,
    todayViews: store.daily[today] ?? 0,
    last7: lastNDays(7).map((date) => ({ date, count: store.daily[date] ?? 0 })),
  };
}
