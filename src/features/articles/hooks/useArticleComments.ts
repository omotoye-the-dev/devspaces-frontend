import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "@/shared/hooks/useToast";
import { useAuthStore } from "@/store";
import { useLiveHub } from "@/shared/hooks/useLiveHub";
import { confirmDialog } from "@/shared/hooks/useConfirmDialog";
import { getApiErrorMessage } from "@/shared/lib/utils/apiError";
import {
  getArticleComments,
  createComment,
  deleteComment,
  likeComment,
} from "@/features/articles/api/articleApi";
import {
  addReplyToComment,
  countAllComments,
  findCommentById,
  findTopLevelComment,
  normalizeComment,
  removeCommentById,
  setCommentLoadingReplies,
  setCommentRepliesData,
  setCommentRepliesOpen,
  unwrapComments,
  updateCommentLikeState,
  type DisplayComment,
} from "@/features/articles/utils/commentTree";

/**
 * Comment thread state for one article: loading, live refresh, posting
 * comments/replies, expanding replies, liking and deleting.
 */
export function useArticleComments(
  articleId: string,
  onCommentCountChange?: (count: number) => void,
) {
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

  const refreshComments = useCallback(async (): Promise<void> => {
    try {
      const data = await getArticleComments(articleId);
      const commentsList = unwrapComments(data);

      const displayComments = commentsList.map(normalizeComment);
      setComments(displayComments);
      onCommentCountChange?.(countAllComments(displayComments));
    } catch {
      // Silently ignore real-time refresh failures
    }
  }, [articleId, onCommentCountChange]);

  // Real-time comment updates via SignalR (/ws/hub/posts/comments/{id}/live)
  useLiveHub({
    type: "comment",
    id: articleId,
    onUpdate: () => {
      void refreshComments();
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function loadComments() {
      try {
        setIsLoading(true);

        const data = await getArticleComments(articleId);

        if (!isMounted) {
          return;
        }

        const commentsList = unwrapComments(data);

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

  const handleSubmitComment = async (event: FormEvent) => {
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

    const isTopLevel = comments.some((c) => c.id === comment.id);
    const mentionUsername = !isTopLevel
      ? comment.user?.username?.trim() ||
        comment.user?.userName?.trim() ||
        comment.user?.name?.trim()
      : null;

    setReplyingTo(comment.id);
    setReplyText(mentionUsername ? `@${mentionUsername} ` : "");
  };

  const handleSubmitReply = async (event: FormEvent, clickedCommentId: string) => {
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

    // Replies always flatten under the top-level comment, regardless of which
    // reply within the thread the user tapped "Reply" on.
    const threadRoot = findTopLevelComment(comments, clickedCommentId);
    const parentId = threadRoot?.id ?? clickedCommentId;

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
      const list = unwrapComments(data);

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
      })),
    );

    try {
      await likeComment(commentId);

      setComments((previous) =>
        updateCommentLikeState(previous, commentId, (comment) => ({
          ...comment,
          isLiking: false,
        })),
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
        })),
      );

      toast.error(getApiErrorMessage(err) || "Failed to update like status");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const target = findCommentById(comments, commentId);
    if (!target) return;

    const hasReplies = (target.replies?.length ?? 0) > 0 || (target.repliesCount ?? 0) > 0;

    const confirmed = await confirmDialog({
      title: "Delete this comment?",
      description: hasReplies
        ? "This will also remove its replies. This action cannot be undone."
        : "This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    const previous = comments;
    setComments((current) => removeCommentById(current, commentId));

    try {
      await deleteComment(articleId, commentId);
      toast.success("Comment deleted");
    } catch (err: unknown) {
      console.error("Error deleting comment:", err);
      setComments(previous);
      toast.error(getApiErrorMessage(err) || "Failed to delete comment");
    }
  };

  const cancelReply = (): void => {
    setReplyingTo(null);
    setReplyText("");
  };

  return {
    comments,
    isLoading,
    newComment,
    setNewComment,
    isSubmitting,
    replyingTo,
    replyText,
    setReplyText,
    isReplying,
    user,
    isAuthenticated,
    handleSubmitComment,
    handleReplyClick,
    handleSubmitReply,
    handleToggleReplies,
    handleLikeComment,
    handleDeleteComment,
    cancelReply,
  };
}
