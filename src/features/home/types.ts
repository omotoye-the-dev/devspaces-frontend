/** View models for the home feed and trending tab. */

export interface Author {
  name: string;
  title: string;
  avatarUrl?: string;
  badge?: string;
}

export interface ArticleFeedItem {
  id: string;
  author: Author;
  date: string;
  title: string;
  description: string;
  tags: { label: string; variant: "primary" | "teal" | "neutral" | "outline" }[];
  likes: number;
  comments: number;
  readTime: string;
  coverImage: string;
  liked?: boolean;
  saved?: boolean;
}

export interface TrendingPostItem {
  kind: "post";
  id: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  tags: string[];
  likes: number;
  comments: number;
  readTime: string;
  liked: boolean;
  saved: boolean;
}

export interface TrendingDiscussionItem {
  kind: "discussion";
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  tags: string[];
  upvotes: number;
  comments: number;
  liked: boolean;
}

export interface TrendingResourceItem {
  kind: "resource";
  id: string;
  title: string;
  description: string;
  category: string;
  logoUrl?: string;
  uploaderName: string;
  uploaderAvatar?: string;
  date: string;
  tags: string[];
  upvotes: number;
  downloads: number;
  saved: boolean;
}

export type TrendingFeedItem = TrendingPostItem | TrendingDiscussionItem | TrendingResourceItem;
export type TrendingFilter = "All" | "Posts" | "Discussions" | "Resources";
