import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { CACHE_TTL, cached, invalidateArticlesCache } from "./cache";
import { categories, deskCategories, formatCategories } from "./categories";
import {
  type CardFilters,
  dbClearOtherTops,
  dbCountCards,
  dbDeleteArticle,
  dbFindByTitle,
  dbGetArticleBySlug,
  dbGetArticles,
  dbGetCards,
  dbSlugExists,
  dbUpsertArticle,
  hasDatabase,
} from "./db";
import type { AdminRole, Article } from "./types";

export { categories, deskCategories, formatCategories };

const bundledDataPath = path.join(process.cwd(), "data");
const runtimeDataPath =
  process.env.DATA_DIR ||
  (process.env.VERCEL ? path.join("/tmp", "newsclient-data") : bundledDataPath);
const storePath = path.join(runtimeDataPath, "articles.json");
const bundledStorePath = path.join(bundledDataPath, "articles.json");
const cloudinaryArticlesPublicId =
  process.env.CLOUDINARY_ARTICLES_PUBLIC_ID || "newsclient/articles.json";

// How long a just-written local store copy is trusted before we re-sync from
// Cloudinary. Long enough that the publisher's own instance reads its fresh
// write; short enough that other instances converge quickly.
const FRESH_WINDOW_MS = 20_000;

export const starterArticles: Article[] = [
  {
    title: "Election commission sets new code for campaign finance disclosures",
    slug: "election-commission-campaign-finance-code",
    excerpt:
      "Parties will face tighter reporting windows as regulators seek clearer public records before the next national vote.",
    body: [
      "The Election Commission has issued a revised code for campaign finance disclosures, requiring political parties to submit itemized spending statements within tighter deadlines.",
      "Officials said the rules are intended to reduce ambiguity around donor reporting, constituency-level expenditure, and third-party campaign activity.",
      "Legal observers expect the new framework to be tested quickly as parties prepare for a crowded election calendar and increasingly expensive media campaigns.",
    ],
    language: "en",
    category: "Politics",
    contentType: "news",
    tags: ["Elections", "Campaign finance", "Regulation"],
    author: "Maira Ahmed",
    featuredImage:
      "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&w=1400&q=80",
    mediaUrl:
      "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&w=1400&q=80",
    mediaType: "image",
    imageCaption: "A polling station prepared for voters in Lahore.",
    status: "published",
    publishedAt: "2026-05-02T08:30:00+05:00",
    readingTime: 5,
    views: 28420,
    isBreaking: true,
    isFeatured: true,
  },
  {
    title: "Rupee steadies as remittances lift early summer inflows",
    slug: "rupee-remittances-summer-inflows",
    excerpt:
      "Currency dealers report calmer trading after overseas remittances and export receipts improved market liquidity.",
    body: [
      "The rupee held steady in interbank trading as remittance inflows and export receipts helped ease pressure on the currency market.",
      "Dealers said demand from importers remained manageable, though energy payments may shape the direction of trading later in the month.",
      "Analysts cautioned that durable stability will depend on reserves, fiscal discipline, and the pace of external financing.",
    ],
    language: "en",
    category: "Business",
    contentType: "news",
    tags: ["Rupee", "Remittances", "Markets"],
    author: "Danish Raza",
    featuredImage:
      "https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=1400&q=80",
    mediaUrl:
      "https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=1400&q=80",
    mediaType: "image",
    imageCaption: "Currency notes counted at a money exchange counter.",
    status: "published",
    publishedAt: "2026-05-01T16:45:00+05:00",
    readingTime: 3,
    views: 15110,
    isBreaking: false,
    isFeatured: false,
  },
  {
    title: "Pakistan name young pace attack for England series",
    slug: "pakistan-young-pace-attack-england-series",
    excerpt:
      "Selectors have leaned into speed and rotation as the team prepares for a demanding away schedule.",
    body: [
      "Pakistan have named a younger pace attack for the upcoming England series, with selectors arguing that workload management will be central to the tour.",
      "The squad includes two uncapped fast bowlers and a returning all-rounder expected to strengthen the lower order.",
      "Team officials said final combinations will depend on pitch conditions and the availability of senior players recovering from minor injuries.",
    ],
    language: "en",
    category: "Sports",
    contentType: "news",
    tags: ["Cricket", "Pakistan", "England"],
    author: "Hamza Noor",
    featuredImage:
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1400&q=80",
    mediaUrl:
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1400&q=80",
    mediaType: "image",
    imageCaption: "A cricket ground before the start of play.",
    status: "published",
    publishedAt: "2026-05-01T13:00:00+05:00",
    readingTime: 4,
    views: 21190,
    isBreaking: false,
    isFeatured: false,
  },
  {
    title: "AI policy draft proposes national data trust for public services",
    slug: "ai-policy-national-data-trust",
    excerpt:
      "The proposal would create a controlled framework for using government datasets in health, education, and civic planning.",
    body: [
      "A draft artificial intelligence policy proposes a national data trust to govern how public datasets may be used for automated services.",
      "The framework includes consent standards, audit logs, and limits on commercial reuse of sensitive citizen data.",
      "Technology groups welcomed the consultation process but urged policymakers to clarify procurement rules and liability standards.",
    ],
    language: "en",
    category: "Technology",
    contentType: "news",
    tags: ["AI", "Policy", "Data"],
    author: "Nimra Saleem",
    featuredImage:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    mediaUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    mediaType: "image",
    imageCaption: "A public technology lab used for civic software training.",
    status: "scheduled",
    publishedAt: "2026-05-03T09:00:00+05:00",
    readingTime: 6,
    views: 9040,
    isBreaking: false,
    isFeatured: false,
  },
  {
    title: "Editorial: A serious newspaper must still make room for slow facts",
    slug: "serious-newspaper-slow-facts-editorial",
    excerpt:
      "The fastest feed is not always the clearest public record. Newsrooms need both urgency and restraint.",
    body: [
      "A serious newspaper is judged not only by how quickly it reacts, but by how carefully it separates signal from noise.",
      "Pakistan's public conversation is loud, compressed, and often punitive toward correction. That makes editorial patience a civic requirement, not a luxury.",
      "The discipline of slow facts can coexist with digital speed if newsrooms make verification visible and treat updates as part of the record.",
    ],
    language: "en",
    category: "Editorials",
    contentType: "editorial",
    tags: ["Media", "Newsroom", "Verification"],
    author: "Editorial Board",
    featuredImage:
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80",
    mediaUrl:
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80",
    mediaType: "image",
    imageCaption: "Newspapers stacked at a city kiosk.",
    status: "draft",
    publishedAt: "2026-05-02T07:00:00+05:00",
    readingTime: 5,
    views: 6320,
    isBreaking: false,
    isFeatured: false,
  },
  {
    title: "In pictures: Monsoon drains cleared before first heavy spell",
    slug: "monsoon-drains-cleared-photo-report",
    excerpt:
      "City crews opened drainage channels across low-lying neighbourhoods as residents prepared for another wet week.",
    body: [
      "Photo editors followed municipal crews working along major storm-water drains before the first heavy monsoon spell.",
      "The pictures show desilting work, temporary traffic diversions, and residents moving household goods away from exposed lanes.",
      "Officials said the operation will continue through the week in areas where standing water disrupted traffic last year.",
    ],
    language: "en",
    category: "Photos",
    contentType: "photo",
    tags: ["Photos", "Monsoon", "Karachi"],
    author: "Photo Desk",
    featuredImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    mediaUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    mediaType: "image",
    imageCaption: "Workers clear a drainage channel before forecast rain.",
    status: "published",
    publishedAt: "2026-05-02T12:20:00+05:00",
    readingTime: 2,
    views: 11840,
    isBreaking: false,
    isFeatured: false,
  },
  {
    title: "Video: Inside the newsroom morning budget meeting",
    slug: "video-newsroom-morning-budget-meeting",
    excerpt:
      "Editors explain how the day's lead stories are selected, verified, and assigned across desks.",
    body: [
      "This newsroom video follows the morning editorial budget meeting, where editors weigh public interest, verification needs, and available reporting capacity.",
      "The segment shows how photo, video, and copy teams coordinate around breaking stories without losing track of follow-up reporting.",
      "Editors said the format will become a regular feature for readers who want more transparency around coverage decisions.",
    ],
    language: "en",
    category: "Videos",
    contentType: "video",
    tags: ["Video", "Newsroom", "Editorial"],
    author: "Digital Desk",
    featuredImage:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80",
    mediaUrl:
      "https://res.cloudinary.com/demo/video/upload/w_1400,h_900,c_fill/docs/walking_talking.mp4",
    mediaType: "video",
    imageCaption: "A newsroom planning meeting filmed for readers.",
    status: "published",
    publishedAt: "2026-05-02T14:05:00+05:00",
    readingTime: 3,
    views: 17650,
    isBreaking: false,
    isFeatured: false,
  },
];

async function writeArticles(articles: Article[]) {
  // Local first: it is the primary READ source (see readArticleStore), so a
  // publish is visible on this instance the instant the write returns.
  // Cloudinary is written second for durability / cross-instance sync — its
  // delivery URL lags several seconds, which is why it must not be the reader.
  await writeLocalArticles(articles);

  if (hasCloudinaryStore()) {
    await writeCloudinaryArticles(articles);
  }
}

async function writeLocalArticles(articles: Article[]) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(articles, null, 2), "utf8");
}

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

async function readCloudinaryArticles() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;

  const response = await fetch(
    `https://res.cloudinary.com/${cloudName}/raw/upload/${cloudinaryArticlesPublicId}?_=${Date.now()}`,
    { cache: "no-store" },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Cloudinary article store returned HTTP ${response.status}.`);
  }

  return (await response.json()) as Article[];
}

async function writeCloudinaryArticles(articles: Article[]) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary article store is missing required credentials.");
  }

  const timestamp = Math.round(Date.now() / 1000).toString();
  const params = {
    invalidate: "true",
    overwrite: "true",
    public_id: cloudinaryArticlesPublicId,
    timestamp,
  };
  const form = new FormData();
  const json = JSON.stringify(articles, null, 2);

  form.append("file", new Blob([json], { type: "application/json" }), "articles.json");
  form.append("api_key", apiKey);
  form.append("invalidate", params.invalidate);
  form.append("overwrite", params.overwrite);
  form.append("public_id", params.public_id);
  form.append("timestamp", timestamp);
  form.append("signature", signCloudinaryParams(params, apiSecret));

  // Retry a couple of times so a transient network blip does not fail an
  // otherwise-valid publish (the local copy is already written by this point).
  let response: Response | undefined;
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        { method: "POST", body: form },
      );
      break;
    } catch (error) {
      lastError = error;
      // Rebuild is unnecessary; the FormData is reusable. Brief backoff.
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }

  if (!response) {
    throw new Error(
      `Cloudinary article store is unreachable: ${
        lastError instanceof Error ? lastError.message : "network error"
      }`,
    );
  }

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;

    throw new Error(
      result?.error?.message ||
        `Cloudinary article store upload failed with HTTP ${response.status}.`,
    );
  }
}

async function readBundledArticles() {
  if (bundledStorePath === storePath) return null;

  try {
    return JSON.parse(await readFile(bundledStorePath, "utf8")) as Article[];
  } catch {
    return null;
  }
}

function normalizeSlug(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `story-${Date.now()}`
  );
}

// The last-resort snapshot bundled in the repo (data/articles.json). Used when
// the database can't be reached — including when Neon returns 402 for an
// exhausted data-transfer quota — so a DB outage degrades to slightly-stale
// content instead of a 500 on every page.
async function readBundledSnapshot(): Promise<Article[]> {
  try {
    return JSON.parse(await readFile(bundledStorePath, "utf8")) as Article[];
  } catch {
    return starterArticles;
  }
}

// Reads the active store — Neon, or the Cloudinary/file store when DB_URL is
// unset. No cache and no relabel here; those wrap it below so they apply to
// every store identically.
async function readArticleStore(): Promise<Article[]> {
  if (hasDatabase) {
    try {
      return await dbGetArticles();
    } catch (error) {
      // Reads fall back to the bundled snapshot so the public site stays up if
      // Neon is unreachable (e.g. 402 quota). Writes still surface the real
      // error to the admin — we must not pretend a write succeeded.
      console.error("Article DB read failed; serving bundled snapshot.", error);
      return readBundledSnapshot();
    }
  }

  // A save writes the local file synchronously, so just after a publish the
  // local copy is fresh and reflects it immediately — whereas Cloudinary's
  // delivery URL lags the upload ~5s (that lag was the "shows on the 2nd try"
  // bug). But a serverless instance that only ever reads would otherwise keep a
  // stale local copy forever, so we trust local only inside a short window after
  // its last write; past that we re-sync from Cloudinary. This bounds
  // cross-instance staleness to ~FRESH_WINDOW while keeping the publisher's own
  // instance instant.
  try {
    const info = await stat(storePath);
    if (Date.now() - info.mtimeMs < FRESH_WINDOW_MS) {
      return JSON.parse(await readFile(storePath, "utf8")) as Article[];
    }
  } catch {
    // No local file yet (cold start) — fall through to seed it below.
  }

  if (hasCloudinaryStore()) {
    const cloudinaryArticles = await readCloudinaryArticles();
    if (cloudinaryArticles) {
      await writeLocalArticles(cloudinaryArticles);
      return cloudinaryArticles;
    }
  }

  // Cloudinary unavailable: use a stale local copy if we have one, else seed.
  try {
    return JSON.parse(await readFile(storePath, "utf8")) as Article[];
  } catch {
    const seedArticles = (await readBundledArticles()) ?? starterArticles;
    await writeArticles(seedArticles);
    return seedArticles;
  }
}

// React cache() dedupes within a single render so the header, the page body,
// related, and top-story rails share ONE store read per request. We intentionally
// do NOT cache across requests: a cross-request cache made publishes appear only
// on the second load (stale-while-revalidate), which is not acceptable for a
// newsroom. The Cloudinary store's bandwidth easily covers one read per render.
// (If Neon is ever re-enabled, add cross-request caching back with immediate
// read-your-writes invalidation — Server Actions + updateTag — not "max".)
export const getArticles = cache(loadArticles);

async function loadArticles(): Promise<Article[]> {
  const articles = await readArticleStore();

  // Relabel scheduled stories whose time has passed as published — in memory,
  // for every store. Visibility was already correct via isLive(); this keeps
  // the admin dashboard badge honest without a write on the read path.
  return articles.map((article) =>
    article.status === "scheduled" && isLive(article)
      ? { ...article, status: "published" as const }
      : article,
  );
}

// Guards against an accidental double-submit of the same story.
function sameContent(a: Article, b: Article) {
  return (
    a.title.trim() === b.title.trim() &&
    (a.excerpt || "").trim() === (b.excerpt || "").trim() &&
    a.body.join("\n\n").trim() === b.body.join("\n\n").trim() &&
    a.language === b.language &&
    a.createdBy === b.createdBy
  );
}

export async function saveArticle(article: Article) {
  // Dedup + slug-collision. In DB mode both are targeted queries (same-title
  // rows, then slug existence checks) — never a full-table body read. The file
  // fallback still reads the whole store, but that path only runs if the DB is
  // unreachable.
  let matchingArticle: Article | undefined;
  if (hasDatabase) {
    const sameTitle = await dbFindByTitle(
      article.title.trim(),
      article.language,
      article.createdBy,
    );
    matchingArticle = sameTitle.find((item) => sameContent(item, article));
  } else {
    const articles = await getArticles();
    matchingArticle = articles.find((item) => sameContent(item, article));
    const existingSlugs = new Set(articles.map((item) => item.slug));
    const baseSlug = normalizeSlug(article.slug || article.title);
    let slug = baseSlug;
    let counter = 2;

    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const savedArticle = { ...article, slug };

    await writeArticles(enforceSingleTop([savedArticle, ...articles], savedArticle));
    await invalidateArticlesCache();
    return savedArticle;
  }

  if (matchingArticle) {
    return matchingArticle;
  }

  const baseSlug = normalizeSlug(article.slug || article.title);
  let slug = baseSlug;
  let counter = 2;

  while (await dbSlugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const savedArticle = { ...article, slug };

  await dbUpsertArticle(savedArticle);
  await dbClearOtherTops(savedArticle);
  await invalidateArticlesCache();
  return savedArticle;
}

// A story can only be the "Top story" (priority >= 2) lead of its own language.
// Enforced here so neither the editor nor the dashboard button can leave two.
function enforceSingleTop(articles: Article[], featured: Article) {
  if ((featured.priority ?? 0) < 2) return articles;
  return articles.map((item) =>
    item.slug !== featured.slug &&
    item.language === featured.language &&
    (item.priority ?? 0) >= 2
      ? { ...item, priority: 0 }
      : item,
  );
}

export async function updateArticle(slug: string, article: Article) {
  const nextSlug = normalizeSlug(article.slug || slug);
  const updatedArticle = { ...article, slug: nextSlug };

  if (hasDatabase) {
    // Existence + rename-collision as two tiny existence queries — no full read.
    if (!(await dbSlugExists(slug))) return null;
    if (nextSlug !== slug && (await dbSlugExists(nextSlug, slug))) {
      throw new Error("Another story already uses this slug.");
    }
    await dbUpsertArticle(updatedArticle);
    // The slug is the primary key, so a rename leaves the old row behind.
    if (nextSlug !== slug) await dbDeleteArticle(slug);
    await dbClearOtherTops(updatedArticle);
    await invalidateArticlesCache();
    return updatedArticle;
  }

  const articles = await getArticles();
  const index = articles.findIndex((item) => item.slug === slug);
  if (index === -1) return null;
  if (articles.some((item) => item.slug === nextSlug && item.slug !== slug)) {
    throw new Error("Another story already uses this slug.");
  }
  const nextArticles = [...articles];
  nextArticles[index] = updatedArticle;
  await writeArticles(enforceSingleTop(nextArticles, updatedArticle));
  await invalidateArticlesCache();
  return updatedArticle;
}

export async function deleteArticle(slug: string) {
  if (hasDatabase) {
    const removed = await dbDeleteArticle(slug);
    await invalidateArticlesCache();
    return removed;
  }

  const articles = await getArticles();
  const nextArticles = articles.filter((article) => article.slug !== slug);
  await writeArticles(nextArticles);
  await invalidateArticlesCache();
  return nextArticles.length !== articles.length;
}

// Admin accounts are not shared: a normal admin only ever sees and edits the
// stories they created, while the super admin sees the whole newsroom. Defined
// once here so every page and API route enforces the same rule.
type Viewer = { role: AdminRole; email: string };

export function canManageArticle(article: Article, viewer: Viewer) {
  return viewer.role === "super_admin" || article.createdBy === viewer.email;
}

export function articlesFor(articles: Article[], viewer: Viewer) {
  return viewer.role === "super_admin"
    ? articles
    : articles.filter((article) => canManageArticle(article, viewer));
}

// A story is publicly visible when it is published, or when it is scheduled and
// its publish time has arrived. Deciding this at read time means a scheduled
// story goes live to the second, with no cron job that can misfire or be missed
// (Vercel's hobby plan only runs cron once a day, which would be useless here).
export function isLive(article: Article, now = Date.now()) {
  if (article.status === "published") return true;

  return (
    article.status === "scheduled" &&
    new Date(article.publishedAt).getTime() <= now
  );
}

// Relabel a due-scheduled story as published, in memory, so listings and the
// admin badge agree with what readers see. Visibility itself is isLive().
function relabel(article: Article): Article {
  return article.status === "scheduled" && isLive(article)
    ? { ...article, status: "published" as const }
    : article;
}

// Applies the card filters in JS — the fallback when the DB is unreachable, so
// the site still renders from the bundled/Cloudinary store.
function filterCardsFromStore(all: Article[], f: CardFilters): Article[] {
  const now = Date.now();
  const q = f.search?.toLowerCase();
  let rows = all.filter((a) => {
    if (f.liveOnly && !isLive(a, now)) return false;
    if (f.status && a.status !== f.status) return false;
    if (f.language && a.language !== f.language) return false;
    if (f.category && a.category !== f.category) return false;
    if (f.createdBy && a.createdBy !== f.createdBy) return false;
    if (f.excludeSlug && a.slug === f.excludeSlug) return false;
    if (f.priorityMin != null && (a.priority ?? 0) < f.priorityMin) return false;
    if (q) {
      const hay = [a.title, a.excerpt, a.author, a.body.join(" "), a.category, a.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  rows = rows.sort((a, b) =>
    f.orderBy === "priority"
      ? (b.priority ?? 0) - (a.priority ?? 0) ||
        +new Date(b.publishedAt) - +new Date(a.publishedAt)
      : +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
  const start = f.offset ?? 0;
  return f.limit != null ? rows.slice(start, start + f.limit) : rows.slice(start);
}

// The workhorse read: a body-stripped list for every listing/render that does
// not show article bodies. DB mode => a single indexed query with LIMIT.
export async function getCards(opts: CardFilters = {}): Promise<Article[]> {
  if (hasDatabase) {
    try {
      return await cached("cards", opts, CACHE_TTL.cards, async () =>
        (await dbGetCards(opts)).map(relabel),
      );
    } catch (error) {
      console.error("Card DB read failed; using store fallback.", error);
    }
  }
  // Filter on raw status (isLive handles due-scheduled), then relabel for display.
  return filterCardsFromStore(await readArticleStore(), opts).map(relabel);
}

export async function countCards(opts: CardFilters = {}): Promise<number> {
  if (hasDatabase) {
    try {
      return await cached("count", opts, CACHE_TTL.count, () =>
        dbCountCards(opts),
      );
    } catch (error) {
      console.error("Card count DB read failed; using store fallback.", error);
    }
  }
  return filterCardsFromStore(await readArticleStore(), {
    ...opts,
    limit: undefined,
    offset: undefined,
  }).length;
}

// One full article (with body). DB mode => a single-row read; the only place the
// body column is ever transferred, and only for one story.
export async function getFullArticleBySlug(
  slug: string,
): Promise<Article | undefined> {
  if (hasDatabase) {
    try {
      return await cached("article", slug, CACHE_TTL.article, async () => {
        const article = await dbGetArticleBySlug(slug);
        return article ? relabel(article) : undefined;
      });
    } catch (error) {
      console.error("Single-article DB read failed; using store.", error);
    }
  }
  const found = (await readArticleStore()).find((a) => a.slug === slug);
  return found ? relabel(found) : undefined;
}

// All live cards (body stripped). Used by the sitemap; other listings call
// getCards directly with tighter filters.
export async function getPublishedArticles() {
  return getCards({ liveOnly: true });
}

// Admin/edit lookup — full article, any status.
export async function getArticleBySlug(slug: string) {
  return getFullArticleBySlug(slug);
}

export async function getPublishedArticleBySlug(slug: string) {
  const article = await getFullArticleBySlug(slug);
  return article && isLive(article) ? article : undefined;
}

// Same-language related stories, same-category first, then filled with other
// same-language stories — two small LIMITed card queries, never the full table.
export async function getRelatedArticles(article: Article) {
  const sameCategory = await getCards({
    liveOnly: true,
    language: article.language,
    category: article.category,
    excludeSlug: article.slug,
    limit: 3,
  });
  if (sameCategory.length >= 3) return sameCategory.slice(0, 3);

  const filler = await getCards({
    liveOnly: true,
    language: article.language,
    excludeSlug: article.slug,
    limit: 6,
  });
  const seen = new Set(sameCategory.map((a) => a.slug));
  const merged = [...sameCategory];
  for (const item of filler) {
    if (merged.length >= 3) break;
    if (!seen.has(item.slug)) {
      seen.add(item.slug);
      merged.push(item);
    }
  }
  return merged.slice(0, 3);
}
