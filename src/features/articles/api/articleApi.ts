import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ArticleFormData } from "../schemas/articleSchema";

export interface Article extends Partial<ArticleFormData> {
  id: string;
  authorId: string;
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  tags?: string[];
  tagNames?: string[];
  coverImageUrl?: string | null;
  coverImage?: string;
  readingTimeMinutes?: number;
  readingTime?: number;
  likeCount?: number;
  likes?: number;
  liked?: boolean;
  isLiked?: boolean;
  viewCount?: number;
  commentCount?: number;
  comments?: number;
  status?: "draft" | "published" | "scheduled" | "archived";
  createdAt: string;
  updatedAt?: string;
}

/** GET /api/posts/feed — fetch the post feed */
export async function getArticles(): Promise<Article[]> {
  const response = await apiClient.get<Article[] | { data?: Article[] }>(ENDPOINTS.POSTS.FEED);
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray((response.data as { data?: Article[] }).data)) {
    return (response.data as { data: Article[] }).data;
  }
  return [];
}

/** GET /api/posts/{id} — fetch a single post */
export async function getArticleById(id: string): Promise<Article> {
  const response = await apiClient.get<Article>(ENDPOINTS.POSTS.DETAIL(id));
  return response.data;
}

/** POST /api/posts — create a new post */
export async function createArticle(data: ArticleFormData): Promise<Article> {
  const response = await apiClient.post<Article>(ENDPOINTS.POSTS.CREATE, data);
  return response.data;
}

/** PUT /api/posts/{id} — update an existing post */
export async function updateArticle(id: string, data: Partial<ArticleFormData>): Promise<Article> {
  const response = await apiClient.put<Article>(ENDPOINTS.POSTS.DETAIL(id), data);
  return response.data;
}

/** DELETE /api/posts/{id} — delete a post */
export async function deleteArticle(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.POSTS.DETAIL(id));
}

/** POST /api/posts/{id}/like — like or unlike a post */
export async function likeArticle(id: string): Promise<void> {
  await apiClient.post(ENDPOINTS.POSTS.LIKE(id));
}
