import type { Category } from "./types";

export const categories: Category[] = [
  { name: "News", slug: "news", group: "format" },
  { name: "Editorials", slug: "editorials", group: "format" },
  { name: "Photos", slug: "photos", group: "format" },
  { name: "Videos", slug: "videos", group: "format" },
  { name: "Pakistan", slug: "pakistan", group: "desk" },
  { name: "Politics", slug: "politics", group: "desk" },
  { name: "Business", slug: "business", group: "desk" },
  { name: "World", slug: "world", group: "desk" },
  { name: "Sports", slug: "sports", group: "desk" },
  { name: "Technology", slug: "technology", group: "desk" },
  { name: "Opinion", slug: "opinion", group: "desk" },
];

export const formatCategories = categories.filter(
  (category) => category.group === "format",
);

export const deskCategories = categories.filter(
  (category) => category.group === "desk",
);
