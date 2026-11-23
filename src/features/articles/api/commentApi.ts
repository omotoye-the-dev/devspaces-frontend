import { apiClient } from "@/shared/lib/api/client";
import { ENDPOINTS } from "@/shared/lib/api/endpoints";
import type { Comment } from "./articleApi.types";

/* Article comments: list, create, delete, like. */

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
export async function getArticleComments(postId: string, parentId?: string): Promise<Comment[]> {
  const response = await apiClient.get<Comment[] | { data?: Comment[] }>(
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
  const dataObj = (
    resData && typeof resData === "object"
      ? resData.data || resData.comment || resData.result || resData.item || resData
      : null
  ) as Record<string, unknown> | null;

  const returnedMessage =
    typeof dataObj?.message === "string" &&
    dataObj.message.trim() &&
    !dataObj.message.toLowerCase().includes("successfully") &&
    !dataObj.message.toLowerCase().includes("comment added") &&
    !dataObj.message.toLowerCase().includes("reply added")
      ? dataObj.message
      : message;

  return {
    id: (dataObj?.id ||
      dataObj?.commentId ||
      `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`) as string,
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
 * DELETE /api/posts/{id}/comments/{commentId}
 */
export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.POSTS.COMMENT_DETAIL(postId, commentId));
}

/**
 * POST /api/posts/comments/{commentId}/like
 */
export async function likeComment(commentId: string): Promise<void> {
  await apiClient.post(ENDPOINTS.POSTS.LIKE_COMMENT(commentId), {});
}
