import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse, PaginatedResponse } from "@/types/resources.types";
import type {
  CreateCommentDto,
  CreateDiscussionDto,
  Discussion,
  DiscussionAuthor,
  DiscussionComment,
} from "@/types/discussions.types";

type DiscussionCollectionResponse =
  | ApiResponse<Discussion[]>
  | PaginatedResponse<Discussion>
  | Discussion[];

type DiscussionResponse = ApiResponse<Discussion> | Discussion;
type ReplyCollectionResponse = ApiResponse<DiscussionComment[]> | DiscussionComment[];
type ReplyResponse = ApiResponse<DiscussionComment> | DiscussionComment;

function unwrap<T>(response: ApiResponse<T> | T): T {
  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response &&
    "success" in response
  ) {
    return response.data;
  }

  return response;
}

function unwrapCollection(response: DiscussionCollectionResponse): Discussion[] {
  if (Array.isArray(response)) return response;
  return response.data;
}

function unwrapReplies(response: ReplyCollectionResponse): DiscussionComment[] {
  if (Array.isArray(response)) return response;
  return response.data;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeAuthor(value: unknown): DiscussionAuthor {
  const author = isRecord(value) ? value : {};
  const firstName = getString(author.firstName, "");
  const lastName = getString(author.lastName, "");
  const name = getString(
    author.name ?? author.fullName,
    `${firstName} ${lastName}`.trim() || "DevSpace Developer",
  );

  const username = getString(author.username ?? author.userName, "developer");

  return {
    id: getString(author.id ?? author.userId, "unknown-author"),
    name: name === "DevSpace Developer" ? username : name,
    username,
    avatarUrl:
      typeof author.avatarUrl === "string" ? author.avatarUrl : undefined,
    role: typeof author.role === "string" ? author.role : undefined,
  };
}

function normalizeComment(value: unknown): DiscussionComment {
  const comment = isRecord(value) ? value : {};

  return {
    id: getString(comment.id, `reply-${Date.now()}`),
    discussionId: getString(comment.discussionId ?? comment.postId, ""),
    content: getString(comment.content ?? comment.details ?? comment.message, ""),
    createdAt: getString(comment.createdAt, "Recently"),
    upvotes:
      typeof comment.upvotes === "number"
        ? comment.upvotes
        : typeof comment.upvoteCount === "number"
          ? comment.upvoteCount
          : 0,
    isUpvoted: Boolean(comment.isUpvoted ?? comment.isUpvotedByMe),
    author: normalizeAuthor(comment.author ?? comment.user),
  };
}

function normalizeDiscussion(value: unknown): Discussion {
  const discussion = isRecord(value) ? value : {};
  const commentsValue = Array.isArray(discussion.comments)
    ? discussion.comments
    : Array.isArray(discussion.replies)
      ? discussion.replies
      : [];
  const comments = commentsValue.map(normalizeComment);

  return {
    id: getString(discussion.id, `discussion-${Date.now()}`),
    title: getString(discussion.title, "Untitled discussion"),
    content: getString(discussion.content ?? discussion.details, ""),
    author: normalizeAuthor(discussion.creator ?? discussion.author ?? discussion.user),
    tags: Array.isArray(discussion.tags)
      ? discussion.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    createdAt: getString(discussion.createdAt, "Recently"),
    upvotes:
      typeof discussion.upvotes === "number" ? discussion.upvotes : 0,
    downvotes:
      typeof discussion.downvotes === "number" ? discussion.downvotes : 0,
    likeCount:
      typeof discussion.likeCount === "number"
        ? discussion.likeCount
        : typeof discussion.likes === "number"
          ? discussion.likes
          : 0,
    saveCount:
      typeof discussion.saveCount === "number" ? discussion.saveCount : 0,
    isLiked: Boolean(discussion.isLiked ?? discussion.liked),
    userVote:
      discussion.userVote === "up" || discussion.userVote === "down"
        ? discussion.userVote
        : null,
    commentsCount:
      typeof discussion.replyCount === "number"
        ? discussion.replyCount
        : typeof discussion.commentsCount === "number"
          ? discussion.commentsCount
          : comments.length,
    comments,
    isSolved: Boolean(discussion.isSolved),
    isBookmarked: Boolean(discussion.isBookmarked ?? discussion.saved ?? discussion.isSaved),
  };
}

export interface DiscussionQueryParams {
  sort?: string;
  search?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export async function getDiscussions(
  params?: DiscussionQueryParams,
): Promise<Discussion[]> {
  const response = await apiClient.get<DiscussionCollectionResponse>(
    ENDPOINTS.DISCUSSIONS.BASE,
    { params },
  );
  return unwrapCollection(response.data).map(normalizeDiscussion);
}

export async function getSavedDiscussions(): Promise<Discussion[]> {
  const response = await apiClient.get<DiscussionCollectionResponse>(
    ENDPOINTS.DISCUSSIONS.SAVED,
  );
  return unwrapCollection(response.data).map(normalizeDiscussion);
}

export async function getDiscussionHistory(): Promise<Discussion[]> {
  const response = await apiClient.get<DiscussionCollectionResponse>(
    ENDPOINTS.DISCUSSIONS.HISTORY,
  );
  return unwrapCollection(response.data).map(normalizeDiscussion);
}

export async function clearDiscussionHistory(): Promise<void> {
  await apiClient.delete(ENDPOINTS.DISCUSSIONS.HISTORY);
}

export async function deleteDiscussionFromHistory(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.DISCUSSIONS.HISTORY + `/${id}`);
}

export async function getDiscussionById(id: string): Promise<Discussion> {
  const [discussionResponse, repliesResponse] = await Promise.all([
    apiClient.get<DiscussionResponse>(ENDPOINTS.DISCUSSIONS.DETAIL(id)),
    apiClient.get<ReplyCollectionResponse>(ENDPOINTS.DISCUSSIONS.REPLIES(id)),
  ]);
  const discussion = normalizeDiscussion(unwrap(discussionResponse.data));
  const comments = unwrapReplies(repliesResponse.data).map(normalizeComment);

  return {
    ...discussion,
    comments,
    commentsCount: comments.length,
  };
}

export async function createDiscussion(
  payload: CreateDiscussionDto,
): Promise<Discussion> {
  const requestBody = {
    title: payload.title,
    details: payload.content,
    tags: payload.tags,
  };

  const response = await apiClient.post<DiscussionResponse>(
    ENDPOINTS.DISCUSSIONS.BASE,
    requestBody,
  );
  return normalizeDiscussion(unwrap(response.data));
}

export async function deleteDiscussion(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.DISCUSSIONS.DETAIL(id));
}

export async function getDiscussionReplies(
  discussionId: string,
): Promise<DiscussionComment[]> {
  const response = await apiClient.get<ReplyCollectionResponse>(
    ENDPOINTS.DISCUSSIONS.REPLIES(discussionId),
  );
  return unwrapReplies(response.data).map(normalizeComment);
}

export async function createDiscussionReply(
  discussionId: string,
  payload: CreateCommentDto,
): Promise<DiscussionComment> {
  const response = await apiClient.post<ReplyResponse>(
    ENDPOINTS.DISCUSSIONS.REPLIES(discussionId),
    payload,
  );
  return normalizeComment(unwrap(response.data));
}

export async function deleteDiscussionReply(
  discussionId: string,
  replyId: string,
): Promise<void> {
  await apiClient.delete(
    ENDPOINTS.DISCUSSIONS.REPLY_DETAIL(discussionId, replyId),
  );
}

export async function voteDiscussionReply(
  discussionId: string,
  replyId: string,
  action: 0 | 1,
): Promise<void> {
  await apiClient.post(
    ENDPOINTS.DISCUSSIONS.REPLY_VOTE(discussionId, replyId, action),
    { action },
  );
}

export async function saveDiscussion(id: string): Promise<void> {
  await apiClient.post(ENDPOINTS.DISCUSSIONS.SAVE(id), {});
}

export async function likeDiscussion(id: string): Promise<void> {
  await apiClient.post(ENDPOINTS.DISCUSSIONS.LIKE(id), {});
}
