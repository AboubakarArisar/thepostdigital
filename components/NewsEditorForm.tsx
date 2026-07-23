"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { categories } from "@/lib/categories";
import type {
  AdminRole,
  Article,
  ArticleContentType,
  ArticleMediaType,
  ArticleStatus,
  Language,
} from "@/lib/types";

type TextFieldName = "title" | "excerpt" | "body";
type TextFields = Record<TextFieldName, string>;
type UploadedMedia = {
  url: string;
  publicId?: string;
  mediaType: ArticleMediaType;
  bytes?: number;
};

type NewsEditorFormProps = {
  article?: Article;
  currentRole: AdminRole;
};

// Cloudinary free-plan single-file caps: 10 MB per image, 100 MB per video.
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const punctuationTriggerKeys = new Set([
  " ",
  "Enter",
  "Tab",
  ".",
  ",",
  "!",
  "?",
  ";",
  ":",
]);

const trailingRomanToken = /([A-Za-z][A-Za-z'-]*)([\s.,!?;:،۔؟]*)$/;

const placeholders: Record<
  Language,
  {
    title: string;
    excerpt: string;
    body: string;
    seoTitle: string;
    seoExcerpt: string;
  }
> = {
  en: {
    title: "Story headline",
    excerpt: "Short summary",
    body: "Write the article body here",
    seoTitle: "Story headline preview",
    seoExcerpt: "Search result excerpt preview for the selected language.",
  },
  ur: {
    title: "خبر کی سرخی",
    excerpt: "مختصر خلاصہ",
    body: "مضمون کا متن یہاں لکھیں",
    seoTitle: "خبر کی سرخی کا پیش منظر",
    seoExcerpt: "منتخب زبان کے لیے تلاش کا مختصر پیش منظر۔",
  },
};

async function readJsonResponse<T>(response: Response) {
  const text = await response.text();

  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return { error: text } as T & { error?: string };
  }
}

async function transliterateText(text: string) {
  const response = await fetch("/api/google-input-tools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) return text;

  const data = await readJsonResponse<{ text?: string }>(response);
  return data.text || text;
}

async function transliterateLatestToken(value: string) {
  const match = value.match(trailingRomanToken);
  const token = match?.[1];
  const suffix = match?.[2] ?? "";

  if (!token) return value;

  const converted = await transliterateText(token);
  return `${value.slice(0, match.index)}${converted}${suffix}`;
}

async function transliterateAllRomanWords(value: string) {
  const words = value.match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
  const uniqueWords = Array.from(new Set(words));
  const convertedPairs = await Promise.all(
    uniqueWords.map(async (word) => [word, await transliterateText(word)] as const),
  );
  const converted = new Map(convertedPairs);

  return value.replace(/[A-Za-z][A-Za-z'-]*/g, (word) => converted.get(word) ?? word);
}

// <input type="datetime-local"> speaks "YYYY-MM-DDTHH:mm" in the admin's own
// local time, so convert both ways rather than slicing the ISO string (which
// would silently shift the time by the UTC offset).
function toDateTimeLocal(iso?: string) {
  const date = iso ? new Date(iso) : new Date(Date.now() + 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function NewsEditorForm({ article, currentRole }: NewsEditorFormProps) {
  const router = useRouter();
  const saveInFlight = useRef(false);
  const isEditing = Boolean(article);
  const [language, setLanguage] = useState<Language>(article?.language || "ur");
  const [status, setStatus] = useState<ArticleStatus>(article?.status || "draft");
  const [contentType, setContentType] = useState<ArticleContentType>(
    article?.contentType || "news",
  );
  const [category, setCategory] = useState(article?.category || "Pakistan");
  const [googleUrduInput, setGoogleUrduInput] = useState(true);
  const [isTransliterating, setIsTransliterating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(
    article ? { url: article.mediaUrl, mediaType: article.mediaType } : null,
  );
  const [author, setAuthor] = useState(article?.author || "News Desk");
  const [tags, setTags] = useState(article?.tags.join(", ") || "");
  const [priority, setPriority] = useState(
    String(Math.min(2, Math.max(0, article?.priority ?? 0))),
  );
  const [publishAt, setPublishAt] = useState(() =>
    toDateTimeLocal(article?.status === "scheduled" ? article.publishedAt : undefined),
  );
  const [fields, setFields] = useState<TextFields>({
    title: article?.title || "",
    excerpt: article?.excerpt || "",
    body: article?.body.join("\n\n") || "",
  });

  const writingMode = useMemo(
    () => ({
      dir: language === "ur" ? "rtl" : "ltr",
      lang: language,
      className:
        language === "ur" ? "font-urdu text-right" : "font-sans text-left",
    }),
    [language],
  );
  // The primary button publishes (or schedules) — the separate "Save Draft"
  // button is how you save without publishing. Label it for what it actually
  // does so a super admin isn't told "Save Story" while it goes live.
  const primaryActionLabel =
    currentRole !== "super_admin"
      ? "Submit for Approval"
      : status === "scheduled"
        ? isEditing
          ? "Update Schedule"
          : "Schedule Story"
        : isEditing && status === "published"
          ? "Update Published"
          : "Publish";

  const inputClass =
    "w-full border border-wheat-900 bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-wheat-900";
  const copy = placeholders[language];

  function updateField(name: TextFieldName, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  function formatFileSize(bytes?: number) {
    if (!bytes) return "";
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  async function uploadMedia(file: File | null) {
    setUploadError("");
    setUploadedMedia(null);

    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setUploadError("Only image and video files can be attached to stories.");
      return;
    }

    const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > limit) {
      setUploadError(
        `This file is ${formatFileSize(file.size)}. The Cloudinary free-plan limit is ${
          isVideo ? "100 MB for video" : "10 MB for images"
        }.`,
      );
      return;
    }

    setIsUploading(true);

    try {
      // 1) Ask our server to sign the upload. This request carries no file
      // bytes, so it stays well under Vercel's 4.5 MB function-payload limit.
      const signResponse = await fetch("/api/cloudinary-sign", {
        method: "POST",
      });
      const sign = await readJsonResponse<{
        cloudName?: string;
        apiKey?: string;
        folder?: string;
        timestamp?: string;
        signature?: string;
        error?: string;
      }>(signResponse);

      if (!signResponse.ok || !sign.signature || !sign.cloudName) {
        setUploadError(
          sign.error ||
            `Could not start the upload (HTTP ${signResponse.status}). Check Cloudinary settings.`,
        );
        return;
      }

      // 2) Send the file straight to Cloudinary from the browser — this is what
      // avoids FUNCTION_PAYLOAD_TOO_LARGE for anything over 4.5 MB.
      const resourceType = isVideo ? "video" : "image";
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sign.apiKey ?? "");
      body.append("folder", sign.folder ?? "");
      body.append("timestamp", sign.timestamp ?? "");
      body.append("signature", sign.signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`,
        { method: "POST", body },
      );
      const result = await readJsonResponse<{
        secure_url?: string;
        public_id?: string;
        bytes?: number;
        resource_type?: string;
        error?: { message?: string };
      }>(response);

      if (!response.ok || !result.secure_url) {
        setUploadError(
          result.error?.message ||
            `Cloudinary rejected the upload (HTTP ${response.status}).`,
        );
        return;
      }

      const mediaType: ArticleMediaType =
        result.resource_type === "video" ? "video" : "image";
      setUploadedMedia({
        url: result.secure_url,
        publicId: result.public_id,
        mediaType,
        bytes: result.bytes,
      });
      setContentType(mediaType === "video" ? "video" : "photo");
      setCategory(mediaType === "video" ? "Videos" : "Photos");
      toast.success(`${mediaType === "video" ? "Video" : "Image"} uploaded.`);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Upload failed. Check your connection and Cloudinary credentials.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function slugify(value: string) {
    return (
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `story-${Date.now()}`
    );
  }

  async function saveStory(nextStatus = status) {
    if (saveInFlight.current) return;
    saveInFlight.current = true;
    setSaveError("");
    setSaveMessage("");

    if (!fields.title.trim() || !fields.body.trim()) {
      setSaveError("Title and body are required before saving.");
      saveInFlight.current = false;
      return;
    }

    if ((contentType === "photo" || contentType === "video") && !uploadedMedia?.url) {
      setSaveError("Upload the photo or video before saving this media story.");
      saveInFlight.current = false;
      return;
    }

    const scheduledFor =
      nextStatus === "scheduled" ? new Date(publishAt).getTime() : null;

    if (scheduledFor !== null && !Number.isFinite(scheduledFor)) {
      setSaveError("Pick the date and time this story should go live.");
      saveInFlight.current = false;
      return;
    }

    if (scheduledFor !== null && scheduledFor <= Date.now()) {
      setSaveError(
        "The scheduled time is in the past. Pick a future time, or set the status to Published to publish now.",
      );
      saveInFlight.current = false;
      return;
    }

    setIsSaving(true);

    const mediaType =
      uploadedMedia?.mediaType || (contentType === "video" ? "video" : "image");
    const fallbackImage =
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80";
    const mediaUrl = uploadedMedia?.url || article?.mediaUrl || fallbackImage;
    const endpoint =
      isEditing && article?.slug
        ? `/api/articles/${encodeURIComponent(article.slug)}`
        : "/api/articles";

    try {
      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fields.title.trim(),
          slug: isEditing ? article?.slug : slugify(fields.title),
          excerpt: fields.excerpt.trim(),
          body: fields.body
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean),
          language,
          category,
          contentType,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          author: author.trim() || "News Desk",
          featuredImage:
            mediaType === "image" ? mediaUrl : article?.featuredImage || fallbackImage,
          mediaUrl,
          mediaType,
          imageCaption: fields.excerpt.trim() || fields.title.trim(),
          status: nextStatus,
          publishedAt:
            scheduledFor !== null
              ? new Date(scheduledFor).toISOString()
              : isEditing && article?.publishedAt
                ? article.publishedAt
                : new Date().toISOString(),
          readingTime: Math.max(1, Math.ceil(fields.body.split(/\s+/).length / 220)),
          views: article?.views || 0,
          isBreaking: article?.isBreaking || false,
          isFeatured: article?.isFeatured || false,
          priority: Number.parseInt(priority, 10) || 0,
        }),
      });
      const result = await readJsonResponse<{
        slug?: string;
        status?: ArticleStatus;
        error?: string;
      }>(response);

      if (!response.ok) {
        const message =
          result.error ||
          `Story could not be saved. Server returned HTTP ${response.status}.`;
        setSaveError(message);
        toast.error(message);
        return;
      }

      const savedStatus = result.status || nextStatus;
      setStatus(savedStatus);
      setSaveMessage("Saved.");
      toast.success(
        savedStatus === "published"
          ? "Story published."
          : savedStatus === "pending_approval"
            ? "Submitted for approval."
            : "Story saved.",
      );
      router.refresh();
      router.push("/admin");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Story could not be saved. Check the server and try again.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
      saveInFlight.current = false;
    }
  }

  async function handleUrduInputKey(
    name: TextFieldName,
    key: string,
    value: string,
  ) {
    if (language !== "ur" || !googleUrduInput || !punctuationTriggerKeys.has(key)) {
      return;
    }

    const converted = await transliterateLatestToken(value);
    if (converted !== value) {
      updateField(name, converted);
    }
  }

  async function generateUrduInput() {
    setIsTransliterating(true);
    const [title, excerpt, body] = await Promise.all([
      transliterateAllRomanWords(fields.title),
      transliterateAllRomanWords(fields.excerpt),
      transliterateAllRomanWords(fields.body),
    ]);
    setFields({ title, excerpt, body });
    setLanguage("ur");
    setIsTransliterating(false);
  }

  return (
    <form className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <div>
          <label htmlFor="title" className="editor-label">
            Title
          </label>
          <input
            id="title"
            value={fields.title}
            onChange={(event) => updateField("title", event.target.value)}
            onKeyUp={(event) =>
              handleUrduInputKey("title", event.key, event.currentTarget.value)
            }
            {...writingMode}
            className={`${inputClass} ${writingMode.className} font-serif-display text-3xl font-black`}
            placeholder={copy.title}
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="editor-label">
            Subtitle / Excerpt optional
          </label>
          <textarea
            id="excerpt"
            rows={3}
            value={fields.excerpt}
            onChange={(event) => updateField("excerpt", event.target.value)}
            onKeyUp={(event) =>
              handleUrduInputKey("excerpt", event.key, event.currentTarget.value)
            }
            {...writingMode}
            className={`${inputClass} ${writingMode.className}`}
            placeholder={copy.excerpt}
          />
        </div>

        <div>
          <label htmlFor="body" className="editor-label">
            Body
          </label>
          <textarea
            id="body"
            rows={14}
            value={fields.body}
            onChange={(event) => updateField("body", event.target.value)}
            onKeyUp={(event) =>
              handleUrduInputKey("body", event.key, event.currentTarget.value)
            }
            {...writingMode}
            className={`${inputClass} ${writingMode.className} leading-8`}
            placeholder={copy.body}
          />
        </div>

        <div className="border-2 border-dashed border-wheat-900 p-5">
          <label className="editor-label" htmlFor="featured-image">
            Story media
          </label>
          <input
            id="featured-image"
            type="file"
            accept="image/*,video/*"
            onChange={(event) => uploadMedia(event.target.files?.[0] ?? null)}
            className="sr-only"
          />
          <label
            htmlFor="featured-image"
            className="mt-3 inline-flex cursor-pointer items-center justify-center border-2 border-wheat-900 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-white hover:text-black"
          >
            Choose file
          </label>
          <p className="mt-3 text-sm text-zinc-600">
            Uploaded straight to Cloudinary. Images up to 10 MB, videos up to
            100 MB (free-plan limits).
          </p>
          {isEditing && uploadedMedia?.url && (
            <p className="mt-3 break-all text-sm font-bold">
              Current media: {uploadedMedia.url}
            </p>
          )}
          {isUploading && (
            <p className="mt-3 text-sm font-bold text-zinc-700">
              Uploading image...
            </p>
          )}
          {uploadError && (
            <p className="mt-3 border border-wheat-900 bg-accent-soft p-3 text-sm font-bold text-ink">
              {uploadError}
            </p>
          )}
          {uploadedMedia && (
            <div className="mt-3 overflow-hidden border border-wheat-900 bg-white text-sm">
              <div className="bg-black">
                {uploadedMedia.mediaType === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={uploadedMedia.url}
                    alt="Uploaded story media preview"
                    className="h-auto w-full"
                  />
                ) : (
                  <video
                    src={uploadedMedia.url}
                    controls
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="font-black uppercase tracking-[0.12em]">
                  {uploadedMedia.mediaType} uploaded
                </p>
                <p className="mt-2 text-xs text-zinc-600">
                  {formatFileSize(uploadedMedia.bytes)}
                  {uploadedMedia.publicId ? ` / ${uploadedMedia.publicId}` : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="border-2 border-wheat-900 p-4">
          <label htmlFor="content-type" className="editor-label">
            Story type
          </label>
          <select
            id="content-type"
            value={contentType}
            onChange={(event) =>
              setContentType(event.target.value as ArticleContentType)
            }
            className={inputClass}
          >
            <option value="news">News</option>
            <option value="editorial">Editorial</option>
            <option value="photo">Photo story</option>
            <option value="video">Video story</option>
          </select>

          <label htmlFor="category" className="editor-label">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={inputClass}
          >
            {categories.map((item) => (
              <option key={item.slug}>{item.name}</option>
            ))}
          </select>

          <label htmlFor="language" className="editor-label mt-4">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
            className={inputClass}
          >
            <option value="en">EN</option>
            <option value="ur">UR</option>
          </select>

          <label className="mt-4 flex items-start gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={googleUrduInput}
              onChange={(event) => setGoogleUrduInput(event.target.checked)}
              className="mt-1 h-4 w-4 accent-black"
            />
            Google Urdu input while typing
          </label>
          <p className="mt-2 text-xs leading-5 text-zinc-600">
            Select Urdu, type Roman Urdu, then press space or punctuation to
            convert the latest word to Urdu script.
          </p>

          <label htmlFor="tags" className="editor-label mt-4">
            Tags
          </label>
          <input
            id="tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className={inputClass}
            placeholder="Politics, Lahore"
          />

          <label htmlFor="author" className="editor-label mt-4">
            Author
          </label>
          <input
            id="author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            className={inputClass}
            placeholder="News Desk"
          />

          <label htmlFor="priority" className="editor-label mt-4">
            Homepage placement
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className={inputClass}
          >
            <option value="0">Normal story</option>
            <option value="1">Important — push up</option>
            <option value="2">Top story — show as the big lead</option>
          </select>
          <p className="mt-1 text-xs text-muted">
            Pick “Top story” for the most important news (e.g. a major conflict)
            so it shows as the big headline on the homepage, even if you post
            something newer afterwards.
          </p>

          <label htmlFor="status" className="editor-label mt-4">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ArticleStatus)}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending approval</option>
            <option value="scheduled">Scheduled</option>
            {/* Published and Archived are lifecycle states, not things you pick
                while composing: publishing is what the Publish button does, and
                archiving is a dashboard action. They appear here only when
                editing a story already in that state, so the select stays
                accurate and saving never changes it by accident. */}
            {isEditing && status === "published" && (
              <option value="published">Published</option>
            )}
            {isEditing && status === "archived" && (
              <option value="archived">Archived</option>
            )}
          </select>

          {status === "scheduled" && (
            <>
              <label htmlFor="publishAt" className="editor-label mt-4">
                Go live on
              </label>
              <input
                id="publishAt"
                type="datetime-local"
                value={publishAt}
                min={toDateTimeLocal()}
                onChange={(event) => setPublishAt(event.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-muted">
                The story stays hidden until this time, then appears on the site
                automatically. Uses your device&rsquo;s clock.
              </p>
            </>
          )}
        </div>

        <div className="grid gap-2">
          <button
            type="button"
            onClick={generateUrduInput}
            disabled={isTransliterating}
            className="border-2 border-wheat-900 cursor-pointer px-3 py-2 text-sm font-black uppercase tracking-[0.12em] hover:bg-black hover:text-black hover:bg-white disabled:cursor-wait disabled:opacity-60"
          >
            {isTransliterating ? "Converting..." : "Generate Urdu Input"}
          </button>
          <button
            type="button"
            onClick={() => saveStory("draft")}
            disabled={isSaving || isUploading}
            className="border-2 border-wheat-900 cursor-pointer px-3 py-2 text-sm font-black uppercase tracking-[0.12em] hover:bg-black hover:text-black hover:bg-white disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? "Saving..." : isEditing ? "Update Draft" : "Save Draft"}
          </button>
          <button
            type="button"
            disabled={isUploading || isSaving}
            onClick={() =>
              saveStory(
                status === "scheduled" || status === "pending_approval"
                  ? status
                  : "published",
              )
            }
            className="border-2 border-wheat-900 cursor-pointer bg-black px-3 py-2 text-sm font-black uppercase tracking-[0.12em] text-white hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? "Saving..." : primaryActionLabel}
          </button>
          {saveError && (
            <p className="border border-wheat-900 bg-accent-soft p-3 text-sm font-bold">
              {saveError}
            </p>
          )}
          {saveMessage && (
            <p className="border border-wheat-900 bg-white p-3 text-sm font-bold">
              {saveMessage}
            </p>
          )}
        </div>

        <section className="border-2 border-wheat-900 p-4">
          <p className="editor-label">SEO preview</p>
          <div {...writingMode} className={`${writingMode.className} mt-3`}>
            <p className="font-serif-display text-xl font-black">
              {fields.title || copy.seoTitle}
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              {fields.excerpt || copy.seoExcerpt}
            </p>
          </div>
        </section>
      </aside>
    </form>
  );
}
