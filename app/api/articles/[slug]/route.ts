import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession, isSuperAdmin } from "@/lib/auth";
import {
  canManageArticle,
  deleteArticle,
  getArticleBySlug,
  updateArticle,
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  // Another admin's story reads as "not found" rather than "forbidden", so the
  // response never confirms that a story with this slug exists.
  if (!article || !canManageArticle(article, session)) {
    return NextResponse.json({ error: "Story was not found." }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const { slug } = await params;
  const article = (await request.json()) as Partial<Article>;

  try {
    const existing = await getArticleBySlug(slug);

    // Accounts are not shared: a normal admin may only edit their own stories.
    if (existing && !canManageArticle(existing, session)) {
      return NextResponse.json(
        { error: "You can only edit stories you created." },
        { status: 403 },
      );
    }

    // Dashboard tables hold body-stripped cards, so their approve/archive/top
    // PUTs arrive with an empty body. Keep the stored one instead of rejecting
    // the request (and instead of overwriting the story with nothing).
    const body = article.body?.length ? article.body : existing?.body;

    if (!article.title || !article.slug || !body?.length) {
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
    // Scheduling is deferred publishing, so it carries the same super-admin gate.
    const status =
      (requestedStatus === "published" || requestedStatus === "scheduled") &&
      !isSuperAdmin(session)
        ? "pending_approval"
        : requestedStatus === "archived" && !isSuperAdmin(session)
          ? (existing?.status ?? "draft")
          : requestedStatus;
    // The homepage lead is a newsroom-wide decision: a normal admin keeps
    // whatever priority the story already had, whatever the request asked for.
    const priority = isSuperAdmin(session)
      ? (article.priority ?? existing?.priority ?? 0)
      : (existing?.priority ?? 0);
    const approval =
      status === "published" && isSuperAdmin(session)
        ? {
            approvedBy: session.email,
            approvedAt: new Date().toISOString(),
          }
        : {
            approvedBy: undefined,
            approvedAt: undefined,
          };
    const updated = await updateArticle(slug, {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      body,
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
      priority,
      createdBy: article.createdBy || existing?.createdBy || session.email,
      ...approval,
    });

    if (!updated) {
      return NextResponse.json({ error: "Story was not found." }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/search");
    revalidatePath(`/article/${encodeURIComponent(slug)}`);
    revalidatePath(`/article/${encodeURIComponent(updated.slug)}`);

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Story could not be updated." },
      { status: 409 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const { slug } = await params;
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
