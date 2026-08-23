import { directionFor } from "@/lib/format";
import type { Article } from "@/lib/types";

// Bare URLs typed into the body are plain text, so readers cannot click them
// and search engines do not count them as links. Split each paragraph on the
// URLs and render those runs as real anchors.
const urlPattern = /\bhttps?:\/\/[^\s<>()[\]{}"']+/gi;
const allowedRichTextTags = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "div",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "strong",
  "u",
  "ul",
]);

// A trailing . , ! ? : ; is almost always sentence punctuation rather than part
// of the address, and a closing bracket only belongs if it was opened.
function trimTrailing(url: string) {
  let end = url.length;

  while (end > 0) {
    const char = url[end - 1];

    if (".,!?:;".includes(char)) {
      end -= 1;
    } else if (char === ")" && !url.slice(0, end).includes("(")) {
      end -= 1;
    } else {
      break;
    }
  }

  return url.slice(0, end);
}

function linkify(text: string) {
  const nodes: (string | React.ReactElement)[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(urlPattern)) {
    const raw = match[0];
    const href = trimTrailing(raw);
    const start = match.index;

    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));

    nodes.push(
      <a
        key={`${start}-${href}`}
        href={href}
        target="_blank"
        rel="noopener"
        className="break-words underline underline-offset-2 hover:text-accent"
      >
        {href}
      </a>,
    );

    // Anything trimmed off the end (a full stop, a bracket) is still text.
    nodes.push(raw.slice(href.length));
    lastIndex = start + raw.length;
  }

  if (lastIndex === 0) return text;
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return nodes;
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sanitizeRichTextHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?([a-z0-9]+)\b([^>]*)>/gi, (tag, rawName, attrs) => {
      const name = String(rawName).toLowerCase();
      const isClosing = tag.startsWith("</");

      if (!allowedRichTextTags.has(name)) return "";
      if (isClosing) return `</${name}>`;
      if (name !== "a") return `<${name}>`;

      const hrefMatch = String(attrs).match(/\shref=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "";

      return /^https?:\/\//i.test(href) || /^mailto:/i.test(href)
        ? `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener">`
        : "<a>";
    });
}

function isRichTextHtml(value: string) {
  return /<\/?(b|strong|i|em|u|blockquote|ul|ol|li|p|div|br|a)\b/i.test(value);
}

export function ArticleBody({ article }: { article: Article }) {
  return (
    <div
      lang={article.language}
      dir={directionFor(article.language)}
      className={`article-body ${
        article.language === "ur" ? "font-urdu text-right" : "text-left"
      }`}
    >
      {article.body.map((paragraph, index) =>
        isRichTextHtml(paragraph) ? (
          <div
            key={`${index}-${paragraph}`}
            className="rich-article-html"
            dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(paragraph) }}
          />
        ) : (
          <p key={`${index}-${paragraph}`}>{linkify(paragraph)}</p>
        ),
      )}
    </div>
  );
}
