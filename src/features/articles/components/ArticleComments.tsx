import { useEffect, useState, type JSX } from "react";
import { Avatar, Button, Skeleton } from "@/components/common";
import { toast } from "@/hooks/useToast";
import { useAuthStore } from "@/stores/useAuthStore";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import {
  getArticleComments,
  createComment,
  likeComment,
  type Comment,
} from "@/features/articles/api/articleApi";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { AuthUser } from "@/types/auth.types";

export interface ArticleCommentsProps {
  articleId: string;
  initialCommentCount?: number;
  onCommentCountChange?: (count: number) => void;
}

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

function normalizeComment(comment: Comment | DisplayComment): DisplayComment {
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

  const repliesArray = Array.isArray(rawReplies)
    ? rawReplies.map(normalizeComment)
    : [];

  const rawLiked = comment.liked ?? (c.isLiked as boolean | undefined) ?? (c.liked as boolean | undefined);
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

function addReplyToComment(
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

function findCommentById(comments: DisplayComment[], id: string): DisplayComment | null {
  for (const c of comments) {
    if (c.id === id) return c;
    if (c.replies && c.replies.length > 0) {
      const found = findCommentById(c.replies, id);
      if (found) return found;
    }
  }
  return null;
}

function setCommentRepliesOpen(comments: DisplayComment[], id: string, isOpen: boolean): DisplayComment[] {
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

function setCommentLoadingReplies(comments: DisplayComment[], id: string, isLoading: boolean): DisplayComment[] {
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

function setCommentRepliesData(comments: DisplayComment[], id: string, replies: DisplayComment[]): DisplayComment[] {
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

interface CommentItemProps {
  comment: DisplayComment;
  depth: number;
  replyingTo: string | null;
  replyText: string;
  isReplying: boolean;
  currentUser: AuthUser | null;
  onReplyClick: (comment: DisplayComment) => void;
  onReplyTextChange: (value: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (event: React.FormEvent, parentId: string) => Promise<void>;
  onToggleReplies: (commentId: string) => void;
  formatTimeAgo: (dateString: string) => string;
  onLike: (commentId: string) => void;
}

function CommentItem({
  comment,
  depth,
  replyingTo,
  replyText,
  isReplying,
  currentUser,
  onReplyClick,
  onReplyTextChange,
  onCancelReply,
  onSubmitReply,
  onToggleReplies,
  formatTimeAgo,
  onLike,
}: CommentItemProps): JSX.Element {
  const indentation = Math.min(depth, 4) * 16;

  const displayName =
    comment.user?.username?.trim() ||
    comment.user?.userName?.trim() ||
    comment.user?.name?.trim() ||
    comment.userId ||
    "User";

  const displayAvatar = comment.user?.avatarUrl || comment.user?.avatar || undefined;

  const isOwnComment =
    Boolean(currentUser?.id && (currentUser.id === comment.userId || (comment.user?.id && currentUser.id === comment.user.id)));

  const currentUserName =
    currentUser?.userName ||
    currentUser?.username ||
    currentUser?.firstName ||
    "You";

  const currentUserAvatar = currentUser?.avatarUrl || undefined;

  const effectiveRepliesCount =
    comment.replies && comment.replies.length > 0
      ? comment.replies.length
      : (comment.repliesCount ?? 0);

  return (
    <div
      className="space-y-3"
      style={{
        marginLeft: indentation > 0 ? `${indentation}px` : undefined,
      }}
    >
      {/* COMMENT */}
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar
          src={displayAvatar}
          name={displayName}
          alt={displayName}
          size="sm"
          className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
        />

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* User information */}
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="wrap-break-word text-[10px] font-semibold text-gray-900 sm:text-xs">
              {displayName}
            </p>

            {isOwnComment && (
              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-medium text-blue-600 sm:text-[9px]">
                You
              </span>
            )}

            <span className="text-[9px] text-gray-400 sm:text-[10px]">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Message */}
          <p
            className="
              mb-2.5
              wrap-break-words
              text-[10px]
              leading-relaxed
              text-gray-700
              sm:text-xs
            "
          >
            {comment.message}
          </p>

          {/* Actions */}
          <div
            className="
              flex
              items-center
              gap-3
              sm:gap-4
            "
          >
            {/* Like */}
            <button
              type="button"
              disabled={comment.isLiking}
              onClick={() => onLike(comment.id)}
              aria-label={comment.liked ? "Unlike comment" : "Like comment"}
              className={cn(
                "group flex items-center gap-1.5 text-[9px] transition-colors sm:text-[10px]",
                comment.liked
                  ? "font-semibold text-blue-600"
                  : "text-gray-500 hover:text-blue-600",
                comment.isLiking && "cursor-not-allowed opacity-60",
              )}
            >
              {comment.liked ? (
                <AiFillLike className="h-3.5 w-3.5 text-blue-600 transition-transform active:scale-125" />
              ) : (
                <AiOutlineLike className="h-3.5 w-3.5 transition-transform group-hover:text-blue-600 active:scale-125" />
              )}

              <span>
                {(comment.likeCount ?? 0) > 0 ? (
                  <>
                    <span>{comment.likeCount}</span>{" "}
                    <span>{comment.likeCount === 1 ? "Like" : "Likes"}</span>
                  </>
                ) : (
                  "Like"
                )}
              </span>
            </button>

            {/* Reply */}
            <button
              type="button"
              onClick={() => onReplyClick(comment)}
              className="
                text-[9px]
                font-medium
                text-gray-500
                transition-colors
                hover:text-blue-600
                sm:text-[10px]
              "
            >
              Reply
            </button>
          </div>

          {/* View/Hide Replies Toggle */}
          {effectiveRepliesCount > 0 && (
            <button
              type="button"
              onClick={() => onToggleReplies(comment.id)}
              className="
                mt-2
                flex
                items-center
                gap-1.5
                text-[9px]
                font-semibold
                text-blue-600
                transition-colors
                hover:text-blue-700
                hover:underline
                sm:text-[10px]
              "
            >
              {comment.isLoadingReplies ? (
                <span>Loading replies...</span>
              ) : comment.isRepliesOpen ? (
                <span>Hide {effectiveRepliesCount === 1 ? "reply" : "replies"}</span>
              ) : (
                <span>
                  View {effectiveRepliesCount} {effectiveRepliesCount === 1 ? "reply" : "replies"}
                </span>
              )}
            </button>
          )}

          {/* REPLY INPUT */}
          {replyingTo === comment.id && (
            <form
              onSubmit={(event) => onSubmitReply(event, comment.id)}
              className="
                mt-3
                rounded-lg
                border
                border-gray-200
                bg-gray-50
                p-2.5
                sm:p-3
              "
            >
              <div className="flex gap-2.5">
                <Avatar
                  src={currentUserAvatar}
                  name={currentUserName}
                  alt={currentUserName}
                  size="sm"
                  className="
                    h-7
                    w-7
                    shrink-0
                    sm:h-8
                    sm:w-8
                  "
                />

                <textarea
                  value={replyText}
                  onChange={(event) => onReplyTextChange(event.target.value)}
                  placeholder={`Reply to @${displayName}...`}
                  rows={2}
                  autoFocus
                  className="
                    min-w-0
                    flex-1
                    resize-none
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    p-2
                    text-[10px]
                    text-gray-900
                    outline-none
                    transition-all
                    placeholder:text-gray-400
                    focus:border-blue-400
                    focus:ring-2
                    focus:ring-blue-500/20
                    sm:text-xs
                  "
                />
              </div>

              <div
                className="
                  mt-2
                  flex
                  justify-end
                  gap-1.5
                  sm:gap-2
                "
              >
                <button
                  type="button"
                  onClick={onCancelReply}
                  className="
                    px-2.5
                    py-1.5
                    text-[9px]
                    font-medium
                    text-gray-500
                    transition-colors
                    hover:text-gray-900
                    sm:text-[10px]
                  "
                >
                  Cancel
                </button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isReplying || !replyText.trim()}
                  className="
                    text-[9px]
                    sm:text-[10px]
                  "
                >
                  {isReplying ? "Replying..." : "Reply"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* NESTED REPLIES */}
      {comment.isRepliesOpen && comment.replies && comment.replies.length > 0 && (
        <div
          className="
              space-y-4
              border-l
              border-gray-200
              pl-3
              sm:pl-4
            "
        >
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              replyingTo={replyingTo}
              replyText={replyText}
              isReplying={isReplying}
              currentUser={currentUser}
              onReplyClick={onReplyClick}
              onReplyTextChange={onReplyTextChange}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
              onToggleReplies={onToggleReplies}
              formatTimeAgo={formatTimeAgo}
              onLike={onLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ArticleComments({
  articleId,
  initialCommentCount,
  onCommentCountChange,
}: ArticleCommentsProps): JSX.Element {
  const [comments, setComments] = useState<DisplayComment[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [newComment, setNewComment] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [replyText, setReplyText] = useState("");

  const [isReplying, setIsReplying] = useState(false);

  const user = useAuthStore((state) => state.user);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isLoading) {
      onCommentCountChange?.(countAllComments(comments));
    }
  }, [comments, isLoading, onCommentCountChange]);

  useEffect(() => {
    let isMounted = true;

    async function loadComments() {
      try {
        setIsLoading(true);

        const data = await getArticleComments(articleId);

        if (!isMounted) {
          return;
        }

        const commentsList = Array.isArray(data)
          ? data
          : Array.isArray((data as unknown as { data?: Comment[] })?.data)
            ? (data as unknown as { data: Comment[] }).data
            : [];

        const displayComments = commentsList.map(normalizeComment);

        setComments(displayComments);
        onCommentCountChange?.(countAllComments(displayComments));
      } catch (err: unknown) {
        console.error("Error loading comments:", err);

        if (isMounted) {
          toast.error(getApiErrorMessage(err) || "Failed to load comments");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadComments();

    return () => {
      isMounted = false;
    };
  }, [articleId, onCommentCountChange]);

  const handleSubmitComment = async (event: React.FormEvent) => {
    event.preventDefault();

    const message = newComment.trim();

    if (!message) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (!isAuthenticated && !user) {
      toast.error("You must be logged in to comment");
      return;
    }

    try {
      setIsSubmitting(true);

      const createdComment = await createComment(articleId, message, undefined);

      const normalizedComment = normalizeComment({
        ...createdComment,
        message,
        user: {
          id: user?.id ?? createdComment.userId,
          username: user?.userName ?? user?.username ?? user?.firstName ?? "You",
          avatarUrl: user?.avatarUrl ?? null,
        },
      });

      setComments((previous) => {
        const next = [normalizedComment, ...previous];
        onCommentCountChange?.(countAllComments(next));
        return next;
      });

      setNewComment("");
      toast.success("Comment posted successfully!");

      // Sync with server in background to get server IDs and timestamps
      void (async () => {
        try {
          const fresh = await getArticleComments(articleId);
          if (Array.isArray(fresh) && fresh.length > 0) {
            const mapped = fresh.map(normalizeComment);
            setComments(mapped);
            onCommentCountChange?.(countAllComments(mapped));
          }
        } catch {
          // Keep optimistic
        }
      })();
    } catch (err: unknown) {
      console.error("Error posting comment:", err);

      toast.error(getApiErrorMessage(err) || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyClick = (comment: DisplayComment) => {
    if (!isAuthenticated && !user) {
      toast.error("You must be logged in to reply");
      return;
    }

    if (replyingTo === comment.id) {
      setReplyingTo(null);
      setReplyText("");
      return;
    }

    setReplyingTo(comment.id);
    setReplyText("");
  };

  const handleSubmitReply = async (event: React.FormEvent, parentId: string) => {
    event.preventDefault();

    const message = replyText.trim();

    if (!message) {
      toast.error("Reply cannot be empty");
      return;
    }

    if (!isAuthenticated && !user) {
      toast.error("You must be logged in to reply");
      return;
    }

    try {
      setIsReplying(true);

      const createdReply = await createComment(articleId, message, parentId);

      const replyWithUser: DisplayComment = normalizeComment({
        ...createdReply,
        message,
        parentId,
        user: {
          id: user?.id ?? createdReply.userId,
          username: user?.userName ?? user?.username ?? user?.firstName ?? "You",
          avatarUrl: user?.avatarUrl ?? null,
        },
        replies: [],
      });

      setComments((previous) => {
        const updated = addReplyToComment(previous, parentId, replyWithUser);
        onCommentCountChange?.(countAllComments(updated));
        return updated;
      });

      setReplyText("");
      setReplyingTo(null);

      toast.success("Reply posted successfully!");

      // Sync replies for this comment from server in background
      void (async () => {
        try {
          const freshReplies = await getArticleComments(articleId, parentId);
          if (Array.isArray(freshReplies) && freshReplies.length > 0) {
            const mapped = freshReplies.map(normalizeComment);
            setComments((prev) => setCommentRepliesData(prev, parentId, mapped));
          }
        } catch {
          // Keep optimistic
        }
      })();
    } catch (err: unknown) {
      console.error("Error posting reply:", err);

      toast.error(getApiErrorMessage(err) || "Failed to post reply");
    } finally {
      setIsReplying(false);
    }
  };

  const handleToggleReplies = async (commentId: string) => {
    const target = findCommentById(comments, commentId);
    if (!target) return;

    if (target.isRepliesOpen) {
      setComments((prev) => setCommentRepliesOpen(prev, commentId, false));
      return;
    }

    if (target.replies && target.replies.length > 0) {
      setComments((prev) => setCommentRepliesOpen(prev, commentId, true));
      return;
    }

    try {
      setComments((prev) => setCommentLoadingReplies(prev, commentId, true));

      const data = await getArticleComments(articleId, commentId);
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as unknown as { data?: Comment[] })?.data)
          ? (data as unknown as { data: Comment[] }).data
          : [];

      const mappedReplies = list.map(normalizeComment);

      setComments((prev) => setCommentRepliesData(prev, commentId, mappedReplies));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err) || "Failed to load replies");
      setComments((prev) => setCommentLoadingReplies(prev, commentId, false));
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated && !user) {
      toast.error("You must be logged in to like comments");
      return;
    }

    const target = findCommentById(comments, commentId);
    if (!target || target.isLiking) {
      return;
    }

    const previousLiked = Boolean(target.liked);
    const previousLikeCount = target.likeCount ?? 0;

    // Optimistic update
    setComments((previous) =>
      updateCommentLikeState(previous, commentId, (comment) => ({
        ...comment,
        liked: !previousLiked,
        likeCount: Math.max(0, previousLikeCount + (previousLiked ? -1 : 1)),
        isLiking: true,
      }))
    );

    try {
      await likeComment(commentId);

      setComments((previous) =>
        updateCommentLikeState(previous, commentId, (comment) => ({
          ...comment,
          isLiking: false,
        }))
      );
    } catch (err: unknown) {
      console.error("Error liking comment:", err);

      // Revert optimistic update on failure
      setComments((previous) =>
        updateCommentLikeState(previous, commentId, (comment) => ({
          ...comment,
          liked: previousLiked,
          likeCount: previousLikeCount,
          isLiking: false,
        }))
      );

      toast.error(getApiErrorMessage(err) || "Failed to update like status");
    }
  };

  const formatTimeAgo = (dateString: string) => {
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
  };

  return (
    <div
      className="
        w-full
        space-y-5
        rounded-lg
        border
        border-gray-200
        bg-white
        p-4
      "
    >
      <div className="flex items-center justify-between">
        <h2
          className="
            text-xs
            font-bold
            text-gray-900
            sm:text-sm
          "
        >
          Comments ({isLoading ? (initialCommentCount ?? countAllComments(comments)) : countAllComments(comments)})
        </h2>
      </div>

      {user || isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div className="flex gap-3">
            <Avatar
              src={user?.avatarUrl || undefined}
              name={user?.userName || user?.username || user?.firstName || "You"}
              alt={user?.userName || user?.username || user?.firstName || "You"}
              size="sm"
              className="
                h-9
                w-9
                shrink-0
                sm:h-10
                sm:w-10
              "
            />

            <textarea
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Add a thoughtful comment..."
              rows={3}
              className="
                min-w-0
                flex-1
                resize-none
                rounded-lg
                border
                border-gray-200
                p-2.5
                text-[10px]
                outline-none
                transition-all
                placeholder:text-gray-400
                focus:border-blue-400
                focus:ring-2
                focus:ring-blue-500/20
                sm:p-3
                sm:text-xs
              "
            />
          </div>

          {/* Actions */}
          <div
            className="
              flex
              justify-end
              gap-1.5
              sm:gap-2
            "
          >
            <button
              type="button"
              onClick={() => setNewComment("")}
              className="
                px-3
                py-1.5
                text-[10px]
                font-medium
                text-gray-500
                transition-colors
                hover:text-gray-900
                sm:text-xs
              "
            >
              Cancel
            </button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !newComment.trim()}
              className="
                text-[10px]
                sm:text-xs
              "
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div
          className="
            rounded-lg
            border
            border-gray-200
            bg-gray-50
            p-3
            text-center
            text-[10px]
            text-gray-600
            sm:p-4
            sm:text-xs
          "
        >
          <p>
            Sign in to comment on this article.{" "}
            <a
              href="/auth/sign-in"
              className="
                font-semibold
                text-blue-600
                hover:underline
              "
            >
              Sign in here
            </a>
          </p>
        </div>
      )}

      <div className="space-y-5">
        {isLoading ? (
          Array.from({
            length: 3,
          }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <Skeleton variant="circular" width={36} height={36} />

              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton variant="text" width={120} height={14} />

                <Skeleton variant="text" width="100%" height={12} count={2} />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            <p
              className="
                text-[10px]
                sm:text-xs
              "
            >
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              replyingTo={replyingTo}
              replyText={replyText}
              isReplying={isReplying}
              currentUser={user}
              onReplyClick={handleReplyClick}
              onReplyTextChange={setReplyText}
              onCancelReply={() => {
                setReplyingTo(null);
                setReplyText("");
              }}
              onSubmitReply={handleSubmitReply}
              onToggleReplies={handleToggleReplies}
              formatTimeAgo={formatTimeAgo}
              onLike={handleLikeComment}
            />
          ))
        )}
      </div>
    </div>
  );
}

function updateCommentLikeState(
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
        replies: updateCommentLikeState(
          comment.replies as DisplayComment[],
          commentId,
          updater,
        ),
      };
    }

    return comment;
  });
}

export default ArticleComments;

