import { neon } from "@neondatabase/serverless";
import type { AdminUser, Article } from "./types";

const connectionString = process.env.DB_URL;

// Postgres is the article store whenever DB_URL is set; without it lib/data.ts
// falls back to the old JSON store, so nothing breaks if the var is missing.
export const hasDatabase = Boolean(connectionString);

const sql = connectionString ? neon(connectionString) : null;

function client() {
  if (!sql) throw new Error("DB_URL is not set, so Postgres is unavailable.");
  return sql;
}

// Queryable columns for the fields the app filters and sorts on; the full
// article stays in `data` so adding a field to the Article type needs no
// migration and reads need no mapping.
export async function ensureSchema() {
  const db = client();

  await db`
    CREATE TABLE IF NOT EXISTS articles (
      slug TEXT PRIMARY KEY,
      language TEXT NOT NULL,
      status TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      published_at TIMESTAMPTZ NOT NULL,
      priority INTEGER NOT NULL DEFAULT 0,
      data JSONB NOT NULL
    )`;

  await db`
    CREATE INDEX IF NOT EXISTS articles_feed_idx
      ON articles (status, language, published_at DESC)`;

  // Related-story lookups filter by language + category, newest first.
  await db`
    CREATE INDEX IF NOT EXISTS articles_related_idx
      ON articles (language, category, published_at DESC)`;

  // "Top story" lead lookup — only the handful of priority>=2 rows are indexed.
  await db`
    CREATE INDEX IF NOT EXISTS articles_top_idx
      ON articles (language, published_at DESC) WHERE priority >= 2`;

  // Admin accounts are few and every field is scalar, so they get real columns
  // rather than a JSON blob — a credential store should be legible.
  await db`
    CREATE TABLE IF NOT EXISTS admin_users (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      verified_at TIMESTAMPTZ,
      verified_by TEXT
    )`;

  // One row per Karachi calendar day. Lifetime totals are SUM() over this table,
  // so counters can never drift from the per-day history.
  await db`
    CREATE TABLE IF NOT EXISTS analytics_daily (
      day DATE PRIMARY KEY,
      views BIGINT NOT NULL DEFAULT 0,
      unique_visitors BIGINT NOT NULL DEFAULT 0
    )`;
}

// EXPORT-ONLY. Reads every full article body — never call from a render or API
// read path. It exists solely for a deliberate full backup/export. All normal
// reads use dbGetCards (body stripped) or dbGetArticleBySlug (one row).
export async function dbGetArticles(): Promise<Article[]> {
  const rows = await client()`
    SELECT data FROM articles
    WHERE jsonb_typeof(data::jsonb) = 'object'
    ORDER BY published_at DESC`;

  return rows.map((row) => row.data as Article);
}

// One full article (with body) — the only place the heavy body column is read,
// and only ever one row.
export async function dbGetArticleBySlug(slug: string): Promise<Article | null> {
  const rows = await client()`
    SELECT data FROM articles
    WHERE slug = ${slug}
      AND jsonb_typeof(data::jsonb) = 'object'
    LIMIT 1`;

  return rows.length ? (rows[0].data as Article) : null;
}

export type CardFilters = {
  language?: string;
  category?: string;
  createdBy?: string;
  excludeSlug?: string;
  priorityMin?: number;
  status?: string;
  // published, or scheduled whose time has passed.
  liveOnly?: boolean;
  // ILIKE across title/excerpt/author/body/category/tags.
  search?: string;
  orderBy?: "priority" | "date";
  limit?: number;
  offset?: number;
};

// Builds a parameterized card query. `data - 'body'` drops the (heavy) body
// array server-side, so listings never transfer article bodies.
function buildCardQuery(f: CardFilters) {
  const conds: string[] = [`jsonb_typeof(data::jsonb) = 'object'`];
  const params: unknown[] = [];
  const p = (value: unknown) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (f.liveOnly) {
    conds.push(
      `(status = 'published' OR (status = 'scheduled' AND published_at <= now()))`,
    );
  }
  if (f.language) conds.push(`language = ${p(f.language)}`);
  if (f.category) conds.push(`category = ${p(f.category)}`);
  if (f.createdBy) conds.push(`data->>'createdBy' = ${p(f.createdBy)}`);
  if (f.excludeSlug) conds.push(`slug <> ${p(f.excludeSlug)}`);
  if (f.priorityMin != null) conds.push(`priority >= ${p(f.priorityMin)}`);
  if (f.status) conds.push(`status = ${p(f.status)}`);
  if (f.search) {
    const q = p(`%${f.search}%`);
    conds.push(
      `(data->>'title' ILIKE ${q} OR data->>'excerpt' ILIKE ${q} OR ` +
        `data->>'author' ILIKE ${q} OR data->>'body' ILIKE ${q} OR ` +
        `data->>'category' ILIKE ${q} OR data->>'tags' ILIKE ${q})`,
    );
  }

  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const whereParams = [...params]; // snapshot before LIMIT/OFFSET for COUNT
  const order =
    f.orderBy === "priority"
      ? "ORDER BY priority DESC, published_at DESC"
      : "ORDER BY published_at DESC";

  let tail = ` ${order}`;
  if (f.limit != null) tail += ` LIMIT ${p(f.limit)}`;
  if (f.offset != null) tail += ` OFFSET ${p(f.offset)}`;

  return {
    // Older production tables may still have `data` as JSON (not JSONB); cast
    // keeps body-stripping compatible across both column types.
    dataText: `SELECT (data::jsonb - 'body') AS card FROM articles ${where}${tail}`,
    dataParams: params,
    countText: `SELECT count(*)::int AS n FROM articles ${where}`,
    countParams: whereParams,
  };
}

export async function dbGetCards(f: CardFilters): Promise<Article[]> {
  const { dataText, dataParams } = buildCardQuery(f);
  const rows = (await client().query(dataText, dataParams)) as {
    card: Record<string, unknown>;
  }[];
  // body was stripped server-side; card components never read it.
  return rows.map((row) => ({ ...row.card, body: [] }) as unknown as Article);
}

export async function dbCountCards(f: CardFilters): Promise<number> {
  const { countText, countParams } = buildCardQuery(f);
  const rows = (await client().query(countText, countParams)) as { n: number }[];
  return rows[0]?.n ?? 0;
}

export async function dbSlugExists(slug: string, exceptSlug?: string) {
  const rows = exceptSlug
    ? await client()`SELECT 1 FROM articles WHERE slug = ${slug} AND slug <> ${exceptSlug} LIMIT 1`
    : await client()`SELECT 1 FROM articles WHERE slug = ${slug} LIMIT 1`;
  return rows.length > 0;
}

// Content-dedup for the create path: only same-title rows are read (usually 0),
// so the body comparison downstream costs almost no transfer.
export async function dbFindByTitle(
  title: string,
  language: string,
  createdBy: string | undefined,
): Promise<Article[]> {
  const rows = createdBy
    ? await client()`
        SELECT data FROM articles
         WHERE data->>'title' = ${title} AND language = ${language}
           AND data->>'createdBy' = ${createdBy}`
    : await client()`
        SELECT data FROM articles
         WHERE data->>'title' = ${title} AND language = ${language}
           AND (data->>'createdBy') IS NULL`;
  return rows.map((row) => row.data as Article);
}


export async function dbUpsertArticle(article: Article) {
  await client()`
    INSERT INTO articles (slug, language, status, category, published_at, priority, data)
    VALUES (
      ${article.slug}, ${article.language}, ${article.status}, ${article.category},
      ${article.publishedAt}, ${article.priority ?? 0}, ${JSON.stringify(article)}::jsonb
    )
    ON CONFLICT (slug) DO UPDATE SET
      language = EXCLUDED.language,
      status = EXCLUDED.status,
      category = EXCLUDED.category,
      published_at = EXCLUDED.published_at,
      priority = EXCLUDED.priority,
      data = EXCLUDED.data`;
}

export async function dbDeleteArticle(slug: string) {
  const rows = await client()`
    DELETE FROM articles WHERE slug = ${slug} RETURNING slug`;

  return rows.length > 0;
}

// A story can only be the "Top story" (priority >= 2) lead of its own language.
// The JSON store rewrote every record to enforce this; Postgres does it in one
// statement that touches only the rows that actually conflict.
export async function dbClearOtherTops(article: Article) {
  if ((article.priority ?? 0) < 2) return;

  await client()`
    UPDATE articles
       SET priority = 0,
           data = jsonb_set(data, '{priority}', '0')
     WHERE language = ${article.language}
       AND slug <> ${article.slug}
       AND priority >= 2`;
}

export async function dbGetAdminUsers(): Promise<AdminUser[]> {
  const rows = await client()`
    SELECT * FROM admin_users ORDER BY created_at ASC`;

  return rows.map((row) => ({
    email: row.email as string,
    name: row.name as string,
    passwordHash: row.password_hash as string,
    role: row.role as AdminUser["role"],
    status: row.status as AdminUser["status"],
    createdAt: new Date(row.created_at as string).toISOString(),
    ...(row.verified_at
      ? { verifiedAt: new Date(row.verified_at as string).toISOString() }
      : {}),
    ...(row.verified_by ? { verifiedBy: row.verified_by as string } : {}),
  }));
}

// auth.ts hands over the whole list, so mirror that contract: one transaction
// that drops removed accounts and upserts the rest. The table holds at most a
// handful of rows, and doing it atomically means a failure can never leave the
// newsroom with no admins.
export async function dbReplaceAdminUsers(users: AdminUser[]) {
  const db = client();
  const emails = users.map((user) => user.email);

  await db.transaction([
    db`DELETE FROM admin_users WHERE email <> ALL(${emails}::text[])`,
    ...users.map(
      (user) => db`
        INSERT INTO admin_users
          (email, name, password_hash, role, status, created_at, verified_at, verified_by)
        VALUES (
          ${user.email}, ${user.name}, ${user.passwordHash}, ${user.role},
          ${user.status}, ${user.createdAt}, ${user.verifiedAt ?? null},
          ${user.verifiedBy ?? null}
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          status = EXCLUDED.status,
          created_at = EXCLUDED.created_at,
          verified_at = EXCLUDED.verified_at,
          verified_by = EXCLUDED.verified_by`,
    ),
  ]);
}

// Atomic increment. The JSON store did read-modify-write, so two visits landing
// at once silently lost a view; Postgres adds inside the row lock instead.
export async function dbRecordVisit(day: string, isNewVisitor: boolean) {
  await client()`
    INSERT INTO analytics_daily (day, views, unique_visitors)
    VALUES (${day}::date, 1, ${isNewVisitor ? 1 : 0})
    ON CONFLICT (day) DO UPDATE SET
      views = analytics_daily.views + 1,
      unique_visitors =
        analytics_daily.unique_visitors + EXCLUDED.unique_visitors`;
}

export async function dbGetAnalytics(days: string[]) {
  const db = client();
  const [totals] = await db`
    SELECT COALESCE(SUM(views), 0) AS views,
           COALESCE(SUM(unique_visitors), 0) AS visitors
    FROM analytics_daily`;
  const rows = await db`
    SELECT day::text AS day, views FROM analytics_daily
    WHERE day = ANY(${days}::date[])`;
  const byDay = new Map(rows.map((row) => [row.day as string, Number(row.views)]));

  return {
    totalViews: Number(totals.views),
    uniqueVisitors: Number(totals.visitors),
    byDay,
  };
}

export async function dbSeedAnalytics(
  daily: Record<string, number>,
  uniqueVisitors: number,
) {
  const db = client();
  const days = Object.keys(daily).sort();

  await db.transaction(
    days.map(
      (day, index) => db`
        INSERT INTO analytics_daily (day, views, unique_visitors)
        VALUES (
          ${day}::date, ${daily[day]},
          ${index === 0 ? uniqueVisitors : 0}
        )
        ON CONFLICT (day) DO UPDATE SET
          views = EXCLUDED.views,
          unique_visitors = EXCLUDED.unique_visitors`,
    ),
  );
}
