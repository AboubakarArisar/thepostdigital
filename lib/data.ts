import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { categories, deskCategories, formatCategories } from "./categories";
import type { Article } from "./types";

export { categories, deskCategories, formatCategories };

const storePath = path.join(process.cwd(), "data", "articles.json");

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
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(articles, null, 2), "utf8");
}

export async function getArticles() {
  try {
    const contents = await readFile(storePath, "utf8");
    return JSON.parse(contents) as Article[];
  } catch {
    await writeArticles(starterArticles);
    return starterArticles;
  }
}

export async function saveArticle(article: Article) {
  const articles = await getArticles();
  const existingSlugs = new Set(articles.map((item) => item.slug));
  let slug = article.slug;
  let counter = 2;

  while (existingSlugs.has(slug)) {
    slug = `${article.slug}-${counter}`;
    counter += 1;
  }

  const savedArticle = { ...article, slug };
  await writeArticles([savedArticle, ...articles]);
  return savedArticle;
}

export async function updateArticle(slug: string, article: Article) {
  const articles = await getArticles();
  const index = articles.findIndex((item) => item.slug === slug);

  if (index === -1) return null;

  const nextSlug = article.slug || slug;
  const duplicateSlug = articles.some(
    (item) => item.slug === nextSlug && item.slug !== slug,
  );

  if (duplicateSlug) {
    throw new Error("Another story already uses this slug.");
  }

  const updatedArticle = { ...article, slug: nextSlug };
  const nextArticles = [...articles];
  nextArticles[index] = updatedArticle;
  await writeArticles(nextArticles);
  return updatedArticle;
}

export async function deleteArticle(slug: string) {
  const articles = await getArticles();
  const nextArticles = articles.filter((article) => article.slug !== slug);
  await writeArticles(nextArticles);
  return nextArticles.length !== articles.length;
}

export async function getPublishedArticles() {
  return (await getArticles()).filter((article) => article.status === "published");
}

export async function getArticleBySlug(slug: string) {
  return (await getArticles()).find((article) => article.slug === slug);
}

export async function getPublishedArticleBySlug(slug: string) {
  const article = await getArticleBySlug(slug);
  return article?.status === "published" ? article : undefined;
}

export async function getRelatedArticles(article: Article) {
  const published = await getPublishedArticles();
  const related = published
    .filter(
      (item) => item.slug !== article.slug && item.category === article.category,
    )
    .concat(published.filter((item) => item.slug !== article.slug));
  const seenSlugs = new Set<string>();

  return related
    .filter((item) => {
      if (seenSlugs.has(item.slug)) return false;
      seenSlugs.add(item.slug);
      return true;
    })
    .slice(0, 3);
}
