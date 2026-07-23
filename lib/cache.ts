import { Redis } from "@upstash/redis";

// REST-based client — the only kind that works reliably on Vercel's serverless
// runtime (a TCP client like ioredis leaks connections there).
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export const hasCache = Boolean(redis);

// During `next build`, a Redis call is a no-store fetch, which opts a route out
// of static rendering (DYNAMIC_SERVER_USAGE) and floods the build log. Build-time
// reads should come from the source anyway — there is no request to serve yet.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

// Every article-related key embeds this version number. Bumping it on any write
// orphans every previously-cached article/list/count in one operation, so admins
// see their change on the very next read instead of waiting out a TTL — while the
// orphaned keys still expire on their own TTL (no unexpiring keys, ever).
const VERSION_KEY = "articles:ver";
const VERSION_TTL_SECONDS = 60 * 60 * 24; // the version key expires too

async function currentVersion(): Promise<number> {
  if (!redis) return 0;
  try {
    return (await redis.get<number>(VERSION_KEY)) ?? 0;
  } catch {
    return 0; // Redis hiccup -> behave as cache-miss, never crash a read.
  }
}

// Bump after every create/update/delete. INCR re-creates the key if it lapsed.
export async function invalidateArticlesCache() {
  if (!redis || isBuildPhase) return;
  try {
    await redis.incr(VERSION_KEY);
    await redis.expire(VERSION_KEY, VERSION_TTL_SECONDS);
  } catch (error) {
    // A failed bump must never fail the write; the stale cache self-heals at TTL.
    console.error("Cache invalidation failed (non-fatal).", error);
  }
}

// Deterministic key part from query params (stable regardless of key order).
function stableKey(params: unknown): string {
  return JSON.stringify(params, (_key, value) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value as Record<string, unknown>)
            .filter(([, v]) => v !== undefined)
            .sort(([a], [b]) => a.localeCompare(b)),
        )
      : value,
  );
}

// Read-through cache. On a miss it runs `loader`, stores the result with a TTL
// (mandatory — every key expires), and returns it. Any Redis error falls back to
// `loader` so caching can never take the site down.
export async function cached<T>(
  kind: string,
  params: unknown,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  if (!redis || isBuildPhase) return loader();

  let key: string;
  try {
    const version = await currentVersion();
    key = `a:${version}:${kind}:${stableKey(params)}`;
    const hit = await redis.get<T>(key);
    if (hit !== null && hit !== undefined) return hit;
  } catch (error) {
    console.error("Cache read failed; querying source.", error);
    return loader();
  }

  const value = await loader();
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error("Cache write failed (non-fatal).", error);
  }
  return value;
}

// TTLs: short for listings/counts (change often), longer for a single published
// article (rarely changes between edits, and edits bump the version anyway).
export const CACHE_TTL = {
  cards: 180, // 3 min
  count: 180, // 3 min
  article: 600, // 10 min
} as const;
