import { directionFor } from "@/lib/format";
import type { Article } from "@/lib/types";

// Bare URLs typed into the body are plain text, so readers cannot click them
// and search engines do not count them as links. Split each paragraph on the
// URLs and render those runs as real anchors.
const urlPattern = /\bhttps?:\/\/[^\s<>()[\]{}"']+/gi;

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

export function ArticleBody({ article }: { article: Article }) {
  return (
    <div
      lang={article.language}
      dir={directionFor(article.language)}
      className={`article-body ${
        article.language === "ur" ? "font-urdu text-right" : "text-left"
      }`}
    >
      {article.body.map((paragraph) => (
        <p key={paragraph}>{linkify(paragraph)}</p>
      ))}
    </div>
  );
}
