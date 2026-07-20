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

export async function dbGetArticles(): Promise<Article[]> {
  const rows = await client()`
    SELECT data FROM articles ORDER BY published_at DESC`;

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

