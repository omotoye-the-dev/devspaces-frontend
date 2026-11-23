import { useEffect, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/shared/hooks/useToast";
import { confirmDialog } from "@/shared/hooks/useConfirmDialog";
import { getApiErrorMessage } from "@/shared/lib/utils/apiError";
import {
  deleteArticle,
  getArticleById,
  getArticleComments,
  likeArticle,
  saveArticle,
  type Article,
} from "@/features/articles/api/articleApi";
import { followAuthor } from "@/features/profile/api/user.api";
import { useAuthStore } from "@/store";
import { useLiveHub } from "@/shared/hooks/useLiveHub";
import { countAllComments } from "@/features/articles/utils/commentTree";

export interface DisplayArticle extends Article {
  authorName?: string;
  authorUserName?: string;
  authorAvatar?: string;
}

/**
 * Loads an article (plus its comment count), keeps it in sync with live updates,
 * and exposes the reader actions: like, bookmark, follow, share, edit, delete.
 */
export function useArticleDetails(id: string | undefined) {
  const navigate = useNavigate();

  const currentUser = useAuthStore((state) => state.user);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [article, setArticle] = useState<DisplayArticle | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isLiked, setIsLiked] = useState(false);

  const [isBookmarked, setIsBookmarked] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);

  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const [likeCount, setLikeCount] = useState(0);

  const [commentCount, setCommentCount] = useState(0);

  const [isLiking, setIsLiking] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/articles");
      return;
    }

    const articleId = id;

    let isSubscribed = true;

    async function loadArticle(): Promise<void> {
      try {
        setIsLoading(true);

        const [articleResult, commentsResult] = await Promise.allSettled([
          getArticleById(articleId),
          getArticleComments(articleId),
        ]);

        if (!isSubscribed) {
          return;
        }

        if (articleResult.status !== "fulfilled" || !articleResult.value) {
          throw new Error("Failed to load article");
        }

        const data = articleResult.value;

        const articleData = data as Article & Record<string, unknown>;

        const initialLikes = data.likeCount ?? data.likes ?? 0;

        const initialLiked = Boolean(data.liked ?? data.isLiked ?? false);

        const initialSaved = Boolean(
          articleData.isBookmarked ?? articleData.isSaved ?? articleData.saved ?? false,
        );
        const articleAuthor = data.author as Record<string, unknown> | undefined;

        const displayArticle: DisplayArticle = {
          ...data,

          authorName: typeof articleAuthor?.name === "string" ? articleAuthor.name : undefined,

          authorAvatar:
            typeof articleAuthor?.avatarUrl === "string" ? articleAuthor.avatarUrl : undefined,
        };

        setArticle(displayArticle);

        setIsLiked(initialLiked);
        setIsBookmarked(initialSaved);
        setLikeCount(initialLikes);

        let resolvedCommentsCount =
          data.commentCount ??
          data.comments ??
          (articleData.commentsCount as number | undefined) ??
          0;

        if (commentsResult.status === "fulfilled" && Array.isArray(commentsResult.value)) {
          resolvedCommentsCount = countAllComments(commentsResult.value);
        }

        setCommentCount(resolvedCommentsCount);
        const initialFollowing =
          typeof data.author?.following === "boolean"
            ? data.author.following
            : typeof articleData.following === "boolean"
              ? articleData.following
              : typeof articleData.isFollowing === "boolean"
                ? articleData.isFollowing
                : false;

        setIsFollowing(initialFollowing);
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error) || "Failed to load article");

        if (isSubscribed) {
          navigate("/articles");
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    void loadArticle();

    return () => {
      isSubscribed = false;
    };
  }, [id, navigate]);

  // Real-time updates via SignalR (/ws/hub/posts/{id}/live)
  useLiveHub({
    type: "post",
    id,
    onUpdate: (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const update = data as Record<string, unknown>;

      if (typeof update.likesCount === "number") {
        setLikeCount(update.likesCount);
      } else if (typeof update.likes === "number") {
        setLikeCount(update.likes);
      } else if (typeof update.likeCount === "number") {
        setLikeCount(update.likeCount);
      }

      if (typeof update.commentCount === "number") {
        setCommentCount(update.commentCount);
      } else if (typeof update.commentsCount === "number") {
        setCommentCount(update.commentsCount);
      } else if (typeof update.comments === "number") {
        setCommentCount(update.comments);
      }

      setArticle((prev) => (prev ? { ...prev, ...update } : null));
    },
  });

  const handleLike = async (event?: MouseEvent): Promise<void> => {
    event?.preventDefault();
    event?.stopPropagation();

    if (isLiking || !article) {
      return;
    }

    if (!isAuthenticated && !currentUser) {
      toast.info("Please log in to like this article");
      return;
    }

    const previousLiked = isLiked;

    setIsLiked(!previousLiked);

    setLikeCount((previous) => Math.max(0, previous + (previousLiked ? -1 : 1)));

    setIsLiking(true);

    try {
      await likeArticle(article.id);

      toast.success(previousLiked ? "Removed like" : "Liked article");
    } catch (error: unknown) {
      setIsLiked(previousLiked);

      setLikeCount((previous) => Math.max(0, previous + (previousLiked ? 1 : -1)));

      toast.error(getApiErrorMessage(error) || "Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async (event?: MouseEvent): Promise<void> => {
    event?.preventDefault();
    event?.stopPropagation();

    if (isSaving || !article) {
      return;
    }

    if (!isAuthenticated && !currentUser) {
      toast.info("Please log in to save this article");
      return;
    }

    const previousBookmarked = isBookmarked;

    setIsBookmarked(!previousBookmarked);

    setIsSaving(true);

    try {
      await saveArticle(article.id);

      toast.success(previousBookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
    } catch (error: unknown) {
      setIsBookmarked(previousBookmarked);

      toast.error(getApiErrorMessage(error) || "Failed to update bookmark");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFollowToggle = async (): Promise<void> => {
    const targetAuthorId = article?.author?.id || article?.authorId;

    if (isFollowLoading || !targetAuthorId) {
      return;
    }

    if (!isAuthenticated && !currentUser) {
      toast.info("Please log in to follow authors");

      return;
    }

    if (currentUser?.id && targetAuthorId === currentUser.id) {
      toast.info("You cannot follow yourself");

      return;
    }

    const previousState = isFollowing;

    const nextState = !previousState;

    setIsFollowing(nextState);

    setIsFollowLoading(true);

    try {
      const res = await followAuthor(targetAuthorId);

      if (res && typeof res.isFollowing === "boolean") {
        setIsFollowing(res.isFollowing);
      }

      const authorDisplayName =
        article?.author?.name ||
        article?.author?.userName ||
        article?.authorName ||
        "DevSpace Author";

      if (nextState) {
        toast.success(`You are now following ${authorDisplayName}`);
      } else {
        toast.info(`Unfollowed ${authorDisplayName}`);
      }
    } catch (error: unknown) {
      setIsFollowing(previousState);

      toast.error(getApiErrorMessage(error) || "Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleShare = async (): Promise<void> => {
    if (!article) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt ?? article.title,
          url: window.location.href,
        });

        return;
      }

      await navigator.clipboard.writeText(window.location.href);

      toast.success("Link copied to clipboard");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      try {
        await navigator.clipboard.writeText(window.location.href);

        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Unable to share article");
      }
    }
  };

  const handleEdit = (): void => {
    if (!article) {
      return;
    }

    navigate(`/articles/${article.id}/edit`);
  };

  const handleDelete = async (): Promise<void> => {
    if (!article) {
      return;
    }

    const confirmed = await confirmDialog({
      title: "Delete this article?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteArticle(article.id);

      toast.success("Article deleted successfully");

      navigate("/articles");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) || "Failed to delete article");
    }
  };

  const handleCommentsToggle = (): void => {
    setShowComments((previous) => !previous);
  };

  return {
    article,
    isLoading,
    currentUser,
    isLiked,
    isLiking,
    likeCount,
    isBookmarked,
    isSaving,
    isFollowing,
    isFollowLoading,
    commentCount,
    setCommentCount,
    showComments,
    handleLike,
    handleBookmark,
    handleFollowToggle,
    handleShare,
    handleEdit,
    handleDelete,
    handleCommentsToggle,
  };
}
