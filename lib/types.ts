export type Language = "en" | "ur";

export type ArticleStatus =
  | "draft"
  | "pending_approval"
  | "published"
  | "scheduled"
  | "archived";
export type ArticleContentType = "news" | "editorial" | "photo" | "video";
export type ArticleMediaType = "image" | "video";
export type AdminRole = "super_admin" | "admin";
export type AdminAccountStatus = "pending" | "approved" | "rejected";

export type Article = {
  title: string;
  slug: string;
  excerpt: string;
  body: string[];
  language: Language;
  category: string;
  contentType: ArticleContentType;
  tags: string[];
  author: string;
  featuredImage: string;
  mediaUrl: string;
  mediaType: ArticleMediaType;
  imageCaption: string;
  status: ArticleStatus;
  publishedAt: string;
  readingTime: number;
  views: number;
  isBreaking: boolean;
  isFeatured: boolean;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
};

export type Category = {
  name: string;
  nameUr: string;
  slug: string;
  group: "desk" | "format";
};

export type AdminUser = {
  email: string;
  name: string;
  passwordHash: string;
  role: AdminRole;
  status: AdminAccountStatus;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
};
