import { neon } from "@neondatabase/serverless";
import type { Article } from "./types";

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
