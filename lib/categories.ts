import type { Category } from "./types";

export const categories: Category[] = [
  { name: "News", nameUr: "خبریں", slug: "news", group: "format" },
  { name: "Editorials", nameUr: "اداریے", slug: "editorials", group: "format" },
  { name: "Photos", nameUr: "تصاویر", slug: "photos", group: "format" },
  { name: "Videos", nameUr: "ویڈیوز", slug: "videos", group: "format" },
  { name: "Pakistan", nameUr: "پاکستان", slug: "pakistan", group: "desk" },
  { name: "Politics", nameUr: "سیاست", slug: "politics", group: "desk" },
  { name: "Business", nameUr: "کاروبار", slug: "business", group: "desk" },
  { name: "World", nameUr: "دنیا", slug: "world", group: "desk" },
  { name: "Sports", nameUr: "کھیل", slug: "sports", group: "desk" },
  { name: "Technology", nameUr: "ٹیکنالوجی", slug: "technology", group: "desk" },
  { name: "Opinion", nameUr: "رائے", slug: "opinion", group: "desk" },
];

export const formatCategories = categories.filter(
  (category) => category.group === "format",
);

export const deskCategories = categories.filter(
  (category) => category.group === "desk",
);
