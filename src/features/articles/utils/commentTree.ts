import type { Comment } from "@/features/articles/api/articleApi";

/*
 * Pure helpers for the nested comment tree shown under an article.
 * Every updater returns a new array and never mutates its input.
 */

export interface CommentUser {
  id: string;
  username?: string;
  userName?: string;
  name?: string;
  avatarUrl?: string | null;
  avatar?: string | null;
}

export interface DisplayComment extends Omit<Comment, "replies" | "user"> {
  user?: CommentUser | null;
  replies?: DisplayComment[];
  repliesCount?: number;
  isRepliesOpen?: boolean;
  isLoadingReplies?: boolean;
  liked?: boolean;
  likeCount?: number;
  isLiking?: boolean;
}

export function normalizeComment(comment: Comment | DisplayComment): DisplayComment {
  const c = comment as unknown as Record<string, unknown>;
  const rawUser = (comment.user || c.User || c.author) as Record<string, unknown> | undefined;

  const resolvedUser: CommentUser | null = rawUser
    ? {
        id: (rawUser.id || rawUser.userId || comment.userId || "") as string,
        username: (rawUser.username || rawUser.userName || rawUser.name || "User") as string,
        avatarUrl: (rawUser.avatarUrl || rawUser.avatar || null) as string | null,
      }
    : null;

  const rawReplies = comment.replies;
  const repliesCount =
    typeof rawReplies === "number"
      ? rawReplies
      : Array.isArray(rawReplies)
        ? rawReplies.length
        : typeof c.replyCount === "number"
          ? (c.replyCount as number)
          : 0;

  const repliesArray = Array.isArray(rawReplies) ? rawReplies.map(normalizeComment) : [];

  const rawLiked =
    comment.liked ?? (c.isLiked as boolean | undefined) ?? (c.liked as boolean | undefined);
  const rawLikeCount =
    comment.likeCount ??
    (c.likes as number | undefined) ??
    (c.likesCount as number | undefined) ??
    (c.likeCount as number | undefined);

  return {
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    message: comment.message,
    parentId: comment.parentId ?? null,
    createdAt: comment.createdAt,
    user: resolvedUser,
    replies: repliesArray,
    repliesCount,
    isRepliesOpen: repliesArray.length > 0,
    isLoadingReplies: false,
    liked: Boolean(rawLiked),
    likeCount: typeof rawLikeCount === "number" ? Math.max(0, rawLikeCount) : 0,
    isLiking: false,
  };
}

export function addReplyToComment(
  comments: DisplayComment[],
  parentId: string,
  newReply: DisplayComment,
): DisplayComment[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      const currentReplies = Array.isArray(comment.replies) ? comment.replies : [];
      return {
        ...comment,
        replies: [...currentReplies, newReply],
        repliesCount: Math.max((comment.repliesCount ?? 0) + 1, currentReplies.length + 1),
        isRepliesOpen: true,
      };
    }

    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToComment(comment.replies, parentId, newReply),
      };
    }

    return comment;
  });
}

export function removeCommentById(comments: DisplayComment[], id: string): DisplayComment[] {
  return comments
    .filter((c) => c.id !== id)
    .map((c) => {
      if (!c.replies || c.replies.length === 0) return c;
      const replies = removeCommentById(c.replies, id);
      if (replies.length === c.replies.length) return c;
      return { ...c, replies, repliesCount: replies.length };
    });
}

export function findTopLevelComment(comments: DisplayComment[], id: string): DisplayComment | null {
  for (const c of comments) {
    if (c.id === id) return c;
    if (c.replies?.some((r) => r.id === id)) return c;
  }
  return null;
}

const MENTION_PREFIX_REGEX = /^@([a-zA-Z0-9_.]{1,32})\s+/;

export function extractLeadingMention(message: string): {
  mentionUsername: string | null;
  displayMessage: string;
} {
  const match = message.match(MENTION_PREFIX_REGEX);
  if (!match) return { mentionUsername: null, displayMessage: message };
  return { mentionUsername: match[1], displayMessage: message.slice(match[0].length) };
}

export function findCommentById(comments: DisplayComment[], id: string): DisplayComment | null {
  for (const c of comments) {
    if (c.id === id) return c;
    if (c.replies && c.replies.length > 0) {
      const found = findCommentById(c.replies, id);
      if (found) return found;
    }
  }
  return null;
}

export function setCommentRepliesOpen(
  comments: DisplayComment[],
  id: string,
  isOpen: boolean,
): DisplayComment[] {
  return comments.map((c) => {
    if (c.id === id) {
      return { ...c, isRepliesOpen: isOpen };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: setCommentRepliesOpen(c.replies, id, isOpen) };
    }
    return c;
  });
}

export function setCommentLoadingReplies(
  comments: DisplayComment[],
  id: string,
  isLoading: boolean,
): DisplayComment[] {
  return comments.map((c) => {
    if (c.id === id) {
      return { ...c, isLoadingReplies: isLoading };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: setCommentLoadingReplies(c.replies, id, isLoading) };
    }
    return c;
  });
}

export function setCommentRepliesData(
  comments: DisplayComment[],
  id: string,
  replies: DisplayComment[],
): DisplayComment[] {
  return comments.map((c) => {
    if (c.id === id) {
      return {
        ...c,
        replies,
        repliesCount: replies.length,
        isRepliesOpen: true,
        isLoadingReplies: false,
      };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: setCommentRepliesData(c.replies, id, replies) };
    }
    return c;
  });
}

export function countAllComments(comments: Array<Comment | DisplayComment>): number {
  if (!Array.isArray(comments)) return 0;
  return comments.reduce((total, comment) => {
    const rawReplies = comment.replies;
    const loadedRepliesCount =
      Array.isArray(rawReplies) && rawReplies.length > 0
        ? countAllComments(rawReplies as Array<Comment | DisplayComment>)
        : typeof rawReplies === "number"
          ? rawReplies
          : typeof (comment as unknown as DisplayComment).repliesCount === "number"
            ? (comment as unknown as DisplayComment).repliesCount!
            : 0;

    return total + 1 + loadedRepliesCount;
  }, 0);
}

export function updateCommentLikeState(
  comments: DisplayComment[],
  commentId: string,
  updater: (comment: DisplayComment) => DisplayComment,
): DisplayComment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return updater(comment);
    }

    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentLikeState(comment.replies as DisplayComment[], commentId, updater),
      };
    }

    return comment;
  });
}

/** The comments endpoint returns either an array or `{ data: [...] }`. */
export function unwrapComments(data: unknown): Comment[] {
  return Array.isArray(data)
    ? data
    : Array.isArray((data as unknown as { data?: Comment[] })?.data)
      ? (data as unknown as { data: Comment[] }).data
      : [];
}

/** Relative time used in comment threads ("5m ago", "2w ago", then a date). */
export function formatCommentTimeAgo(dateString: string): string {
  const now = new Date();

  const date = new Date(dateString);

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  }

  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }

  if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
