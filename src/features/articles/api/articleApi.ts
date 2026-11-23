import { apiClient } from "@/shared/lib/api/client";
import { ENDPOINTS } from "@/shared/lib/api/endpoints";
import type { Article } from "./articleApi.types";
import type { ArticleFormData } from "@/features/articles/schemas/articleSchema";

/* Single-article endpoints: read, create, update, cover upload, delete, like, save. */

/**
 * GET /api/posts/{id}
 */
export async function getArticleById(id: string): Promise<Article> {
  const response = await apiClient.get<Article>(ENDPOINTS.POSTS.DETAIL(id));

  return response.data;
}

/**
 * POST /api/posts
 */
export async function createArticle(data: ArticleFormData): Promise<Article> {
  const isHttpUrl =
    typeof data.coverImage === "string" &&
    (data.coverImage.startsWith("http://") || data.coverImage.startsWith("https://"));

  const isPublished = data.status === "published";

  const payload = {
    title: data.title,
    content: data.content,

    slug: data.slug || undefined,

    excerpt: data.excerpt || null,
    tagNames: data.tagNames || [],
    coverImageUrl: isHttpUrl ? data.coverImage : null,
    status: isPublished ? 1 : 0,

    publishImmediately: isPublished,
  };

  const response = await apiClient.post<Article>(ENDPOINTS.POSTS.CREATE, payload);

  return response.data;
}

/**
 * PUT /api/posts/{id}
 */
export async function updateArticle(id: string, data: Partial<ArticleFormData>): Promise<Article> {
  const { status, ...rest } = data;

  const isHttpUrl =
    typeof data.coverImage === "string" &&
    (data.coverImage.startsWith("http://") || data.coverImage.startsWith("https://"));

  const isPublished = status === "published";

  const payload = {
    ...rest,

    status: status !== undefined ? (isPublished ? 1 : 0) : undefined,

    publishImmediately: status !== undefined ? isPublished : undefined,

    tags: data.tagNames !== undefined ? data.tagNames : undefined,

    coverImageUrl: data.coverImage !== undefined ? (isHttpUrl ? data.coverImage : null) : undefined,
  };

  const response = await apiClient.put<Article>(ENDPOINTS.POSTS.DETAIL(id), payload);

  return response.data;
}

/**
 * POST /api/posts/{id}/cover-image
 */
export async function uploadArticleCoverImage(
  id: string,
  file: File,
): Promise<
  | {
      coverImageUrl?: string;
      message?: string;
    }
  | Article
> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiClient.post(ENDPOINTS.POSTS.COVER_IMAGE(id), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

/**
 * DELETE /api/posts/{id}
 */
export async function deleteArticle(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.POSTS.DETAIL(id));
}

/**
 * POST /api/posts/{id}/like
 */
export async function likeArticle(id: string): Promise<void> {
  await apiClient.post(ENDPOINTS.POSTS.LIKE(id), {});
}

/**
 * POST /api/posts/{id}/save
 */
export async function saveArticle(id: string): Promise<void> {
  await apiClient.post(`/api/posts/${id}/save`, {});
}

// Re-exported so existing `@/features/articles/api/articleApi` imports keep working.
export type * from "./articleApi.types";
export * from "./feedApi";
export * from "./commentApi";
