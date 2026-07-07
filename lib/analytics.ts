import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const bundledDataPath = path.join(process.cwd(), "data");
const runtimeDataPath =
  process.env.DATA_DIR ||
  (process.env.VERCEL ? path.join("/tmp", "newsclient-data") : bundledDataPath);
const storePath = path.join(runtimeDataPath, "analytics.json");

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

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function lastNDays(count: number) {
  const days: string[] = [];
  const now = new Date();

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - offset);
    days.push(dayKey(day));
  }

  return days;
}

async function readStore(): Promise<AnalyticsStore> {
  try {
    const parsed = JSON.parse(await readFile(storePath, "utf8")) as Partial<AnalyticsStore>;
    return {
      totalViews: parsed.totalViews ?? 0,
      uniqueVisitors: parsed.uniqueVisitors ?? 0,
      daily: parsed.daily ?? {},
    };
  } catch {
    return { totalViews: 0, uniqueVisitors: 0, daily: {} };
  }
}

async function writeStore(store: AnalyticsStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
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
