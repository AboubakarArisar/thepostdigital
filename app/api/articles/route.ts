import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession, isSuperAdmin } from "@/lib/auth";
import {
  articlesFor,
  canManageArticle,
  deleteArticle,
  getArticleBySlug,
  getArticles,
  saveArticle,
} from "@/lib/data";
import type {
  Article,
  ArticleContentType,
  ArticleMediaType,
  ArticleStatus,
  Language,
} from "@/lib/types";

const statuses = new Set([
  "draft",
  "pending_approval",
  "published",
  "scheduled",
  "archived",
]);
const languages = new Set(["en", "ur"]);
const contentTypes = new Set(["news", "editorial", "photo", "video"]);
const mediaTypes = new Set(["image", "video"]);

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  return NextResponse.json({
    articles: articlesFor(await getArticles(), session),
  });
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Admin login required." }, { status: 401 });
    }

    const article = (await request.json()) as Partial<Article>;

    if (!article.title || !article.slug || !article.body?.length) {
      return NextResponse.json(
        { error: "Title, slug, and body are required." },
        { status: 400 },
      );
    }

    if (
      !languages.has(article.language || "") ||
      !statuses.has(article.status || "") ||
      !contentTypes.has(article.contentType || "") ||
      !mediaTypes.has(article.mediaType || "")
    ) {
      return NextResponse.json(
        { error: "Story language, status, type, or media type is invalid." },
        { status: 400 },
      );
    }

    const requestedStatus = article.status as ArticleStatus;
    // Scheduling is just deferred publishing, so it needs the same super-admin
    // gate. Without this an admin could schedule a story a minute out and have
    // it go live without ever passing approval.
    const status =
      (requestedStatus === "published" || requestedStatus === "scheduled") &&
      !isSuperAdmin(session)
        ? "pending_approval"
        : requestedStatus;
    const approval =
      status === "published" && isSuperAdmin(session)
        ? {
            approvedBy: session.email,
            approvedAt: new Date().toISOString(),
          }
        : {};

    const saved = await saveArticle({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      body: article.body,
      language: article.language as Language,
      category: article.category || "News",
      contentType: article.contentType as ArticleContentType,
      tags: article.tags || [],
      author: article.author || "News Desk",
      featuredImage: article.featuredImage || article.mediaUrl || "",
      mediaUrl: article.mediaUrl || article.featuredImage || "",
      mediaType: article.mediaType as ArticleMediaType,
      imageCaption: article.imageCaption || article.title,
      status,
      publishedAt: article.publishedAt || new Date().toISOString(),
      readingTime: article.readingTime || 1,
      views: article.views || 0,
      isBreaking: article.isBreaking || false,
      isFeatured: article.isFeatured || false,
      // Was silently dropped on create, so the editor's "Top story" choice only
      // took effect on a later edit. Super admin only, same as the PUT route.
      priority: isSuperAdmin(session) ? (article.priority ?? 0) : 0,
      createdBy: session.email,
      ...approval,
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/search");
    revalidatePath(`/article/${encodeURIComponent(saved.slug)}`);

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Story could not be saved by the production CRUD route.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }


  const slug = new URL(request.url).searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Story slug is required." }, { status: 400 });
  }

  // An admin may delete their own story, never someone else's.
  const existing = await getArticleBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: "Story was not found." }, { status: 404 });
  }

  if (!canManageArticle(existing, session)) {
    return NextResponse.json(
      { error: "You can only delete stories you created." },
      { status: 403 },
    );
  }

  const deleted = await deleteArticle(slug);

  if (!deleted) {
    return NextResponse.json({ error: "Story was not found." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/search");
  revalidatePath(`/article/${encodeURIComponent(slug)}`);

  return NextResponse.json({ ok: true });
}
