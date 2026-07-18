import type { Category } from "./types";

export const categories: Category[] = [
  { name: "World News", nameUr: "عالمی خبریں", slug: "world", group: "desk" },
  { name: "Pakistan", nameUr: "پاکستان", slug: "pakistan", group: "desk" },
  { name: "Sports", nameUr: "کھیل", slug: "sports", group: "desk" },
  { name: "Bizarre", nameUr: "حیرت انگیز", slug: "bizarre", group: "desk" },
  { name: "Business", nameUr: "تجارت", slug: "business", group: "desk" },
  { name: "Health", nameUr: "صحت", slug: "health", group: "desk" },
  {
    name: "Science & Tech",
    nameUr: "سائنس اور ٹیکنالوجی",
    slug: "science-tech",
    group: "desk",
  },
  { name: "Blogs", nameUr: "بلاگز", slug: "blogs", group: "desk" },
];

export const formatCategories = categories.filter(
  (category) => category.group === "format",
);

export const deskCategories = categories.filter(
  (category) => category.group === "desk",
);
