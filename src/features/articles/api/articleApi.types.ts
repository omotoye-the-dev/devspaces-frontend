import type { ArticleFormData } from "@/features/articles/schemas/articleSchema";

/* Article, comment and feed API types. */

export interface Attachment {
  id?: string;
  type?: string;
  url?: string | null;
  originalFileName?: string | null;
  format?: string | null;
  bytes?: number | null;
  linkTitle?: string | null;
  linkUrl?: string | null;
}

export interface AuthorInfo {
  id?: string;
  name?: string;
  username?: string;
  userName?: string;
  avatarUrl?: string | null;
  totalFollowers?: number;
  totalFollowed?: number;
  following?: boolean;
  articlesCount?: number;
  totalArticles?: number;
  totalPosts?: number;
  postCount?: number;
  postsCount?: number;
}

export interface Article extends Omit<Partial<ArticleFormData>, "status"> {
  id: string;
  authorId: string;

  author?: AuthorInfo | null;
  authorName?: string;

  title: string;
  content: string;

  slug?: string;
  excerpt?: string | null;

  tags?: string[];
  tagNames?: string[];

  attachments?: Attachment[];

  coverImageUrl?: string | null;
  coverImage?: string;

  readingTimeMinutes?: number;
  readingTime?: number;

  likeCount?: number;
  likes?: number;

  liked?: boolean;
  isLiked?: boolean;

  saved?: boolean;
  isBookmarked?: boolean;
  saveCount?: number;

  viewCount?: number;

  commentCount?: number;
  comments?: number;

  status?: "draft" | "published" | 0 | 1 | string | number;

  createdAt: string;
  updatedAt?: string | null;
  publishedAt?: string | null;

  isEditable?: boolean;
  editDeadline?: string | null;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FeedResponse {
  success: boolean;
  message: string;
  data: Article[];
  pagination?: Pagination;
}

export interface MyPostsResponse {
  success: boolean;
  message: string;
  data: Article[];
  pagination?: Pagination;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  message: string;
  parentId: string | null;
  createdAt: string;

  user?: {
    id: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  replies?: Comment[] | number;
  liked?: boolean;
  likeCount?: number;
}

export interface GetFeedParams {
  page?: number;
  pageNumber?: number;
  pageSize?: number;
}

export type TrendingPost = Article;

export interface TrendingResponse {
  success: boolean;
  message: string;
  data: Article[];
  pagination?: Pagination;
}

export interface GetTrendingParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
