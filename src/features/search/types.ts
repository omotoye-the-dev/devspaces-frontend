/** Shapes of the global search results, one per section. */

export interface ArticleResult {
  kind: "article";
  id: string;
  title: string;
  excerpt?: string;
  authorName?: string;
}

export interface ResourceResult {
  kind: "resource";
  id: string;
  title: string;
  description?: string;
  category?: string;
}

export interface DiscussionResult {
  kind: "discussion";
  id: string;
  title: string;
  commentsCount: number;
}

export interface TagResult {
  kind: "tag";
  name: string;
  slug?: string;
  usageCount?: number;
}

export interface PersonResult {
  kind: "person";
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  role?: string;
}

export type SearchResult =
  ArticleResult | ResourceResult | DiscussionResult | TagResult | PersonResult;
