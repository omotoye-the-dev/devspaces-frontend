import { apiClient } from "@/shared/lib/api/client";
import { ENDPOINTS } from "@/shared/lib/api/endpoints";
import type {
  Article,
  Pagination,
  FeedResponse,
  MyPostsResponse,
  GetFeedParams,
  GetTrendingParams,
} from "./articleApi.types";

/* Article feeds: latest, personalized, following, trending, saved, history and my posts. */

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
 * GET /api/posts/feed/personalized (paginated personalized feed)
 */
export async function getPersonalizedArticles(
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
  >(ENDPOINTS.POSTS.PERSONALIZED, { params: queryParams });

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
 * GET /api/posts/feed/personalized
 */
export async function getPersonalizedPosts(params?: GetFeedParams): Promise<Article[]> {
  const result = await getPersonalizedArticles(params);
  return result.data;
}

/**
 * GET /api/posts/my-posts
 */
export async function getMyPosts(): Promise<Article[]> {
  const response = await apiClient.get<
    | MyPostsResponse
    | Article[]
    | {
        data?: Article[];
      }
  >(ENDPOINTS.POSTS.MY_POSTS);

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && Array.isArray((response.data as MyPostsResponse).data)) {
    return (response.data as MyPostsResponse).data;
  }

  return [];
}

/**
 * GET /api/posts/saved (paginated saved/bookmarked articles)
 */
export async function getSavedArticles(
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
  >(ENDPOINTS.POSTS.SAVED, { params: queryParams });

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
 * GET /api/posts/history (paginated reading history for the logged-in user)
 */
export async function getArticleHistory(
  params?: GetFeedParams,
): Promise<{ data: Article[]; pagination?: Pagination }> {
  const response = await apiClient.get<
    | FeedResponse
    | Article[]
    | {
        data?: Article[];
        pagination?: Pagination;
      }
  >(ENDPOINTS.POSTS.HISTORY, { params });

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
 * GET /api/posts/following (paginated following posts feed)
 */
export async function getFollowingArticles(
  params?: GetFeedParams,
): Promise<{ data: Article[]; pagination?: Pagination }> {
  const queryParams = params
    ? {
        ...params,
        ...(params.page !== undefined ? { page: params.page, pageNumber: params.page } : {}),
      }
    : undefined;

  try {
    const response = await apiClient.get<
      | FeedResponse
      | Article[]
      | {
          data?: Article[];
          pagination?: Pagination;
        }
    >(ENDPOINTS.POSTS.FOLLOWING, { params: queryParams });

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
  } catch {
    return { data: [] };
  }
}

/**
 * GET /api/posts/following (returns array of articles)
 */
export async function getFollowingPosts(params?: GetFeedParams): Promise<Article[]> {
  const result = await getFollowingArticles(params);
  return result.data;
}

/**
 * GET /api/posts/trending (paginated trending posts feed)
 */
export async function getTrendingArticles(
  params?: GetTrendingParams,
): Promise<{ data: Article[]; pagination?: Pagination }> {
  const queryParams = params
    ? {
        ...params,
        ...(params.page !== undefined ? { page: params.page, pageNumber: params.page } : {}),
      }
    : undefined;

  try {
    const response = await apiClient.get<
      | FeedResponse
      | Article[]
      | {
          data?: Article[];
          pagination?: Pagination;
        }
    >(ENDPOINTS.POSTS.TRENDING, { params: queryParams });

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
  } catch {
    return { data: [] };
  }
}

/** GET /api/posts/trending — fetch trending posts */
export async function getTrendingPosts(params?: GetTrendingParams): Promise<Article[]> {
  const result = await getTrendingArticles(params);
  return result.data;
}
