import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ArticleFormData } from "../schemas/articleSchema";

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

export interface Article
  extends Omit<Partial<ArticleFormData>, "status"> {
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

  status?:
    | "draft"
    | "published"
    | 0
    | 1
    | string
    | number;

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

/**
 * GET /api/posts/feed (paginated)
 */
export async function getFeedArticles(
  params?: GetFeedParams,
): Promise<{ data: Article[]; pagination?: Pagination }> {
  const queryParams = params
    ? {
        ...params,
        ...(params.page !== undefined ? { page: params.page, pageNumber: params.page } : {}),
      }
    : undefined;

  const response = await apiClient.get<
    | FeedResponse
    | Article[]
    | {
        data?: Article[];
        pagination?: Pagination;
      }
  >(ENDPOINTS.POSTS.FEED, { params: queryParams });

  if (Array.isArray(response.data)) {
    return { data: response.data };
  }

  if (response.data && typeof response.data === "object") {
    const res = response.data as FeedResponse;
    if (Array.isArray(res.data)) {
      return {
        data: res.data,
        pagination: res.pagination,
      };
    }
  }

  return { data: [] };
}

/**
 * GET /api/posts/feed
 */
export async function getArticles(params?: GetFeedParams): Promise<Article[]> {
  const result = await getFeedArticles(params);
  return result.data;
}

/**
 * GET /api/posts/my-posts
 */
export async function getMyPosts(): Promise<Article[]> {
  const response =
    await apiClient.get<
      | MyPostsResponse
      | Article[]
      | {
          data?: Article[];
        }
    >(
      ENDPOINTS.POSTS.MY_POSTS,
    );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    response.data &&
    Array.isArray(
      (response.data as MyPostsResponse).data,
    )
  ) {
    return (
      response.data as MyPostsResponse
    ).data;
  }

  return [];
}

/**
 * GET /api/posts/{id}
 */
export async function getArticleById(
  id: string,
): Promise<Article> {
  const response =
    await apiClient.get<Article>(
      ENDPOINTS.POSTS.DETAIL(id),
    );

  return response.data;
}

/**
 * POST /api/posts
 */
export async function createArticle(
  data: ArticleFormData,
): Promise<Article> {
  const isHttpUrl =
    typeof data.coverImage === "string" &&
    (data.coverImage.startsWith(
      "http://",
    ) ||
      data.coverImage.startsWith(
        "https://",
      ));

  const isPublished =
    data.status === "published";

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

  const response =
    await apiClient.post<Article>(
      ENDPOINTS.POSTS.CREATE,
      payload,
    );

  return response.data;
}

/**
 * PUT /api/posts/{id}
 */
export async function updateArticle(
  id: string,
  data: Partial<ArticleFormData>,
): Promise<Article> {
  const {
    status,
    ...rest
  } = data;

  const isHttpUrl =
    typeof data.coverImage === "string" &&
    (data.coverImage.startsWith(
      "http://",
    ) ||
      data.coverImage.startsWith(
        "https://",
      ));

  const isPublished =
    status === "published";

  const payload = {
    ...rest,

    status:
      status !== undefined
        ? isPublished
          ? 1
          : 0
        : undefined,

    publishImmediately:
      status !== undefined
        ? isPublished
        : undefined,

    tags:
      data.tagNames !== undefined
        ? data.tagNames
        : undefined,

    coverImageUrl:
      data.coverImage !== undefined
        ? isHttpUrl
          ? data.coverImage
          : null
        : undefined,
  };

  const response =
    await apiClient.put<Article>(
      ENDPOINTS.POSTS.DETAIL(id),
      payload,
    );

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

  const response =
    await apiClient.post(
      ENDPOINTS.POSTS.COVER_IMAGE(id),
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      },
    );

  return response.data;
}

/**
 * DELETE /api/posts/{id}
 */
export async function deleteArticle(
  id: string,
): Promise<void> {
  await apiClient.delete(
    ENDPOINTS.POSTS.DETAIL(id),
  );
}

/**
 * POST /api/posts/{id}/like
 */
export async function likeArticle(
  id: string,
): Promise<void> {
  await apiClient.post(
    ENDPOINTS.POSTS.LIKE(id),
    {},
  );
}

/**
 * POST /api/posts/{id}/save
 */
export async function saveArticle(
  id: string,
): Promise<void> {
  await apiClient.post(
    `/api/posts/${id}/save`,
    {},
  );
}

/**
 * GET /api/posts/{id}/comments
 *
 * Get top-level comments:
 *
 *   getArticleComments(postId)
 *
 * Request:
 *
 *   GET /api/posts/{postId}/comments
 *
 * Get replies for a specific comment:
 *
 *   getArticleComments(postId, parentId)
 *
 * Request:
 *
 *   GET /api/posts/{postId}/comments?parentId={parentId}
 *
 * The apiClient automatically attaches:
 *
 *   Authorization: Bearer <token>
 */
export async function getArticleComments(
  postId: string,
  parentId?: string,
): Promise<Comment[]> {
  const response =
    await apiClient.get<
      Comment[] | { data?: Comment[] }
    >(
      `/api/posts/${postId}/comments`,
      {
        params: parentId
          ? {
              parentId,
            }
          : undefined,
      },
    );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data &&
    Array.isArray((response.data as { data?: Comment[] }).data)
  ) {
    return (response.data as { data: Comment[] }).data;
  }

  return [];
}

/**
 * POST /api/posts/{id}/comment
 *
 * Create a top-level comment:
 *
 *   createComment(postId, message)
 *
 * Payload:
 *
 *   {
 *     message: "...",
 *     parentId: null
 *   }
 *
 * Create a reply:
 *
 *   createComment(
 *     postId,
 *     message,
 *     parentCommentId
 *   )
 *
 * Payload:
 *
 *   {
 *     message: "...",
 *     parentId: "parent-comment-id"
 *   }
 */
export async function createComment(
  postId: string,
  message: string,
  parentId?: string,
): Promise<Comment> {
  const response = await apiClient.post<Record<string, unknown>>(
    ENDPOINTS.POSTS.CREATE_COMMENT(postId),
    {
      message,
      parentId: parentId ?? null,
    },
  );

  const resData = response.data;
  const dataObj =
    (resData && typeof resData === "object"
      ? (resData.data || resData.comment || resData.result || resData.item || resData)
      : null) as Record<string, unknown> | null;

  const returnedMessage =
    typeof dataObj?.message === "string" &&
    dataObj.message.trim() &&
    !dataObj.message.toLowerCase().includes("successfully") &&
    !dataObj.message.toLowerCase().includes("comment added") &&
    !dataObj.message.toLowerCase().includes("reply added")
      ? dataObj.message
      : message;

  return {
    id: (dataObj?.id || dataObj?.commentId || `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`) as string,
    postId,
    userId: (dataObj?.userId || "") as string,
    message: returnedMessage,
    parentId: (dataObj?.parentId ?? parentId ?? null) as string | null,
    createdAt: (dataObj?.createdAt || new Date().toISOString()) as string,
    user: (dataObj?.user as Comment["user"]) || null,
    replies: (dataObj?.replies as Comment["replies"]) ?? [],
    liked: false,
    likeCount: 0,
  };
}

/**
 * POST /api/posts/comments/{commentId}/like
 */
export async function likeComment(commentId: string): Promise<void> {
  await apiClient.post(
    ENDPOINTS.POSTS.LIKE_COMMENT(commentId),
    {},
  );
}

export interface TrendingPost {
  id: string;
  authorId?: string;
  author?: AuthorInfo | null;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  tags?: string[];
  coverImageUrl?: string | null;
  readingTimeMinutes?: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  createdAt?: string;
}

export interface TrendingResponse {
  success: boolean;
  message: string;
  data: TrendingPost[];
  pagination?: Pagination;
}

export interface GetTrendingParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/** GET /api/posts/trending — fetch trending posts */
export async function getTrendingPosts(params?: GetTrendingParams): Promise<TrendingPost[]> {
  try {
    const response = await apiClient.get<
      TrendingResponse | TrendingPost[] | { data?: TrendingPost[] }
    >(ENDPOINTS.POSTS.TRENDING, { params });

    const body = response.data;
    if (Array.isArray(body)) {
      return body;
    }
    if (body && typeof body === "object" && "data" in body && Array.isArray(body.data)) {
      return body.data;
    }
    return [];
  } catch {
    return [];
  }
}

