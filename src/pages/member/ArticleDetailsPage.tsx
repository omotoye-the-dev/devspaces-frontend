import { useEffect, useRef, useState, type JSX } from "react";
import {
  Link, useNavigate, useParams,
} from "react-router-dom";
import { AiFillHeart, AiOutlineComment, AiOutlineHeart, AiOutlineShareAlt } from "react-icons/ai";
import { HiOutlineEllipsisHorizontal } from "react-icons/hi2";
import { LuBookmark, LuBookmarkCheck, LuClock } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import articlePlaceholder from "@/assets/images/article-placeholder.jpg";
import { Avatar, Button, Skeleton, Tag } from "@/components/common";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils/cn";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { deleteArticle, getArticleById, getArticleComments, likeArticle, saveArticle, type Article } from "@/features/articles/api/articleApi";
import { followAuthor, getUserProfileById, formatProfileName, getProfileAvatar, type UserProfile } from "@/lib/api/user.api";
import { useAuthStore } from "@/stores/useAuthStore";
import ArticleComments, { countAllComments } from "@/features/articles/components/ArticleComments";
import RelatedArticles from "@/features/articles/components/RelatedArticles";
import AuthorCard from "@/features/articles/components/AuthorCard";

export interface DisplayArticle extends Article {
  authorName?: string;
  authorUserName?: string;
  authorAvatar?: string;
}

export function ArticleDetailsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

const currentUser = useAuthStore(
  (state) => state.user
);

const isAuthenticated = useAuthStore(
  (state) => state.isAuthenticated
);

const [article, setArticle] =
  useState<DisplayArticle | null>(null);

const [authorProfile, setAuthorProfile] =
  useState<UserProfile | null>(null);

const [isLoading, setIsLoading] =
  useState(true);

const [isLiked, setIsLiked] =
  useState(false);

const [isBookmarked, setIsBookmarked] =
  useState(false);

const [isFollowing, setIsFollowing] =
  useState(false);

const [isFollowLoading, setIsFollowLoading] =
  useState(false);

const [likeCount, setLikeCount] =
  useState(0);

const [commentCount, setCommentCount] =
  useState(0);

const [isLiking, setIsLiking] =
  useState(false);

const [isSaving, setIsSaving] =
  useState(false);

const [showMoreMenu, setShowMoreMenu] =
  useState(false);

const [showComments, setShowComments] =
  useState(false);

const pageRef = useRef<HTMLDivElement>(null);
const articleRef = useRef<HTMLElement>(null);
const [readingProgress, setReadingProgress] = useState(0);

useEffect(() => {
  const getScrollContainer = (): HTMLElement | null => {
    return (
      pageRef.current?.closest("main") ??
      document.querySelector("main")
    );
  };

  const handleScroll = () => {
    const container = getScrollContainer();

    let scrollTop = 0;
    let clientHeight = window.innerHeight;
    let scrollHeight = document.documentElement.scrollHeight;

    if (container) {
      scrollTop = container.scrollTop;
      clientHeight = container.clientHeight;
      scrollHeight = container.scrollHeight;
    } else {
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      clientHeight = window.innerHeight;
      scrollHeight = document.documentElement.scrollHeight;
    }

    if (articleRef.current) {
      const articleEl = articleRef.current;
      const containerRect = container ? container.getBoundingClientRect() : { top: 0 };
      const articleRect = articleEl.getBoundingClientRect();

      // Absolute position of article relative to scroll container top
      const articleTop = articleRect.top - containerRect.top + scrollTop;
      const articleBottom = articleTop + articleEl.offsetHeight;

      // Reading completes when bottom of article is in view
      const targetScroll = articleBottom - clientHeight;

      if (targetScroll <= 0) {
        setReadingProgress(100);
        return;
      }

      const progress = (scrollTop / targetScroll) * 100;
      setReadingProgress(Math.min(100, Math.max(0, Math.round(progress))));
    } else {
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) {
        setReadingProgress(100);
        return;
      }
      const progress = (scrollTop / maxScroll) * 100;
      setReadingProgress(Math.min(100, Math.max(0, Math.round(progress))));
    }
  };

  const container = getScrollContainer();

  if (container) {
    container.addEventListener("scroll", handleScroll, { passive: true });
  }
  window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
  window.addEventListener("resize", handleScroll, { passive: true });

  handleScroll();

  return () => {
    if (container) {
      container.removeEventListener("scroll", handleScroll);
    }
    window.removeEventListener("scroll", handleScroll, { capture: true });
    window.removeEventListener("resize", handleScroll);
  };
}, [article?.content]);

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

      const [articleResult, commentsResult] =
        await Promise.allSettled([
          getArticleById(articleId),
          getArticleComments(articleId),
        ]);

      if (!isSubscribed) {
        return;
      }

      if (
        articleResult.status !== "fulfilled" ||
        !articleResult.value
      ) {
        throw new Error("Failed to load article");
      }

      const data = articleResult.value;

      const articleData =
        data as Article &
        Record<string, unknown>;

      const initialLikes =
        data.likeCount ??
        data.likes ??
        0;

      const initialLiked = Boolean(
        data.liked ??
        data.isLiked ??
        false
      );

      const initialSaved = Boolean(
        articleData.isBookmarked ??
        articleData.isSaved ??
        articleData.saved ??
        false
      );
      const articleAuthor =
        data.author as
        | Record<string, unknown>
        | undefined;

      const displayArticle: DisplayArticle = {
        ...data,

        authorName:
          typeof articleAuthor?.name ===
            "string"
            ? articleAuthor.name
            : undefined,

        authorAvatar:
          typeof articleAuthor?.avatarUrl ===
            "string"
            ? articleAuthor.avatarUrl
            : undefined,
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

      if (
        commentsResult.status === "fulfilled" &&
        Array.isArray(commentsResult.value)
      ) {
        resolvedCommentsCount = countAllComments(
          commentsResult.value
        );
      }

      setCommentCount(resolvedCommentsCount);
      const initialFollowing =
        typeof articleData.following ===
          "boolean"
          ? articleData.following
          : typeof articleData.isFollowing ===
            "boolean"
            ? articleData.isFollowing
            : false;

      setIsFollowing(initialFollowing);
      if (data.authorId) {
        try {
          const profile =
            await getUserProfileById(
              data.authorId
            );

          if (
            isSubscribed &&
            profile
          ) {
            setAuthorProfile(profile);
          }
        } catch {
          /**
           * Do not prevent the article from
           * rendering if the profile endpoint
           * fails.
           */
        }
      }
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(error) ||
        "Failed to load article"
      );

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

const handleLike = async (
  event?: React.MouseEvent
): Promise<void> => {
  event?.preventDefault();
  event?.stopPropagation();

  if (
    isLiking ||
    !article
  ) {
    return;
  }

  if (
    !isAuthenticated &&
    !currentUser
  ) {
    navigate("/auth/sign-in");
    return;
  }

  const previousLiked =
    isLiked;

  setIsLiked(
    !previousLiked
  );

  setLikeCount(
    (previous) =>
      Math.max(
        0,
        previous +
        (previousLiked
          ? -1
          : 1)
      )
  );

  setIsLiking(true);

  try {
    await likeArticle(
      article.id
    );

    toast.success(
      previousLiked
        ? "Removed like"
        : "Liked article"
    );
  } catch (
  error: unknown
  ) {
    setIsLiked(
      previousLiked
    );

    setLikeCount(
      (previous) =>
        Math.max(
          0,
          previous +
          (previousLiked
            ? 1
            : -1)
        )
    );

    toast.error(
      getApiErrorMessage(
        error
      ) ||
      "Failed to update like"
    );
  } finally {
    setIsLiking(false);
  }
};

const handleBookmark = async (
  event?: React.MouseEvent
): Promise<void> => {
  event?.preventDefault();
  event?.stopPropagation();

  if (
    isSaving ||
    !article
  ) {
    return;
  }

  if (
    !isAuthenticated &&
    !currentUser
  ) {
    navigate("/auth/sign-in");
    return;
  }

  const previousBookmarked =
    isBookmarked;

  setIsBookmarked(
    !previousBookmarked
  );

  setIsSaving(true);

  try {
    await saveArticle(
      article.id
    );

    toast.success(
      previousBookmarked
        ? "Removed from bookmarks"
        : "Saved to bookmarks"
    );
  } catch (
  error: unknown
  ) {
    setIsBookmarked(
      previousBookmarked
    );

    toast.error(
      getApiErrorMessage(
        error
      ) ||
      "Failed to update bookmark"
    );
  } finally {
    setIsSaving(false);
  }
};

const handleFollowToggle =
  async (): Promise<void> => {
    if (
      isFollowLoading ||
      !article?.authorId
    ) {
      return;
    }

    if (
      !isAuthenticated &&
      !currentUser
    ) {
      toast.error(
        "Please sign in to follow authors"
      );

      navigate(
        "/auth/sign-in"
      );

      return;
    }

    if (
      currentUser?.id &&
      article.authorId ===
      currentUser.id
    ) {
      toast.info(
        "You cannot follow yourself"
      );

      return;
    }

    const previousState =
      isFollowing;

    const nextState =
      !previousState;

    setIsFollowing(
      nextState
    );

    setIsFollowLoading(
      true
    );

    try {
      const res =
        await followAuthor(
          article.authorId
        );

      if (
        res &&
        typeof res.isFollowing ===
        "boolean"
      ) {
        setIsFollowing(
          res.isFollowing
        );
      }

      const authorDisplayName =
        resolvedAuthorName;

      if (nextState) {
        toast.success(
          `You are now following ${authorDisplayName}`
        );
      } else {
        toast.info(
          `Unfollowed ${authorDisplayName}`
        );
      }
    } catch (
    error: unknown
    ) {
      setIsFollowing(
        previousState
      );

      toast.error(
        getApiErrorMessage(
          error
        ) ||
        "Failed to update follow status"
      );
    } finally {
      setIsFollowLoading(
        false
      );
    }
  };

const handleShare =
  async (): Promise<void> => {
    if (!article) {
      return;
    }

    try {
      if (
        navigator.share
      ) {
        await navigator.share(
          {
            title:
              article.title,
            text:
              article.excerpt ??
              article.title,
            url:
              window.location.href,
          }
        );

        return;
      }

      await navigator.clipboard.writeText(
        window.location.href
      );

      toast.success(
        "Link copied to clipboard"
      );
    } catch (
    error
    ) {
      if (
        error instanceof
        DOMException &&
        error.name ===
        "AbortError"
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          window.location.href
        );

        toast.success(
          "Link copied to clipboard"
        );
      } catch {
        toast.error(
          "Unable to share article"
        );
      }
    }
  };

const handleEdit =
  (): void => {
    if (!article) {
      return;
    }

    navigate(
      `/articles/${article.id}/edit`
    );

    setShowMoreMenu(
      false
    );
  };

const handleDelete =
  async (): Promise<void> => {
    if (!article) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this article? This action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteArticle(article.id);

      toast.success("Article deleted successfully");

      navigate("/articles");
    } catch (
    error: unknown
    ) {
      toast.error(
        getApiErrorMessage(
          error
        ) ||
        "Failed to delete article"
      );
    }
  };

const handleCommentsToggle =
  (): void => {
    setShowComments(
      (previous) =>
        !previous
    );
  };

if (isLoading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="hidden lg:col-span-1 lg:flex lg:flex-col lg:items-center lg:gap-4">
            {Array.from({
              length: 5,
            }).map(
              (_, index) => (
                <Skeleton
                  key={index}
                  variant="circular"
                  width={40}
                  height={40}
                />
              )
            )}
          </div>

          <div className="lg:col-span-6">
            <Skeleton
              variant="text"
              width={180}
              height={14}
              className="mb-5"
            />

            <Skeleton
              variant="text"
              width="100%"
              height={38}
              count={2}
              className="mb-5"
            />

            <Skeleton
              variant="text"
              width="90%"
              height={16}
              count={2}
              className="mb-6"
            />

            <Skeleton
              variant="rounded"
              width="100%"
              height={96}
              className="mb-6"
            />

            <Skeleton
              variant="rounded"
              width="100%"
              height={360}
              className="mb-8"
            />

            <Skeleton
              variant="text"
              width="100%"
              height={16}
              count={8}
            />
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <Skeleton
              variant="rounded"
              width="100%"
              height={220}
              className="mb-6"
            />

            <Skeleton
              variant="rounded"
              width="100%"
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

if (!article) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Article not found
        </h1>

        <p className="mb-5 text-sm text-gray-500">
          The article you're looking for doesn't
          exist.
        </p>

        <Button
          onClick={() =>
            navigate("/articles")
          }
          variant="primary"
        >
          Back to Articles
        </Button>
      </div>
    </div>
  );
}

const isAuthor =
  currentUser?.id ===
  article.authorId;

/**
 * Resolve the author's display name
 * using the same helper as AuthorCard.
 */
const resolvedAuthorName =
  formatProfileName(
    authorProfile,
    article.authorName ||
    "DevSpace Author"
  );

/**
 * Resolve the avatar using the same
 * helper as AuthorCard.
 */
const resolvedAuthorAvatar =
  getProfileAvatar(
    authorProfile
  ) ??
  article.authorAvatar;

/**
 * UserProfile can expose username fields
 * with slightly different names depending
 * on the API response.
 *
 * Check the profile first because this is
 * the source of truth for the author.
 */
const profileData =
  authorProfile as
  | (UserProfile &
    Record<string, unknown>)
  | null;

const profileUser = profileData?.user as
  | Record<string, unknown>
  | undefined;

const resolvedAuthorUsername =
  (
    profileData?.userName ??
    profileData?.username ??
    profileData?.user_name ??
    profileData?.handle ??
    profileUser?.userName ??
    profileUser?.username
  )
    ?.toString()
    .trim()
    .replace(/^@/, "") ||
  "DevSpace Author";

const authorProfileIdentifier =
  resolvedAuthorUsername !==
    "DevSpace Author"
    ? resolvedAuthorUsername
    : article.authorId;

const authorProfileUrl =
  authorProfileIdentifier
    ? `/profile/${article.authorId}`
    : "/profile";

const formattedDate =
  new Date(
    article.createdAt
  ).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

const readingTime =
  article.readingTimeMinutes ??
  article.readingTime ??
  Math.max(
    1,
    Math.ceil(
      (article.content?.length ??
        0) / 200
    )
  );

const coverImage =
  article.coverImage ??
  article.coverImageUrl ??
  articlePlaceholder;

return (
  <div ref={pageRef} className="min-h-screen w-full bg-gray-50">
    {/* Top Fixed Reading Progress Bar */}
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-linear-to-r from-primary via-blue-500 to-indigo-500 transition-all duration-100 ease-out"
        style={{ width: `${readingProgress}%` }}
      />
    </div>

    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* In-page Sticky Reading Progress Bar */}
      <div className="sticky -top-2 sm:-top-4 md:-top-6 z-30 mb-8 bg-gray-50/95 py-2 backdrop-blur-xs">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-label="Reading progress"
          aria-valuenow={Math.round(readingProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-linear-to-r from-primary to-blue-500 transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </div>

      <div className="flex w-full justify-between gap-8 lg:gap-12">
        {/* Left action bar */}
        <aside className="hidden shrink-0 lg:flex">
          <div className="sticky top-8 flex h-fit flex-col items-center gap-1 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              disabled={isLiking}
              title={
                isLiked
                  ? "Unlike"
                  : "Like"
              }
              aria-label={
                isLiked
                  ? "Unlike article"
                  : "Like article"
              }
              className={cn(
                "flex w-14 flex-col items-center gap-1 rounded-lg p-2.5 transition",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isLiked
                  ? "bg-red-50 text-red-500"
                  : "text-gray-400 hover:bg-gray-50 hover:text-red-500"
              )}
            >
              {isLiked ? (
                <AiFillHeart className="h-5 w-5" />
              ) : (
                <AiOutlineHeart className="h-5 w-5" />
              )}

              <span
                className={cn(
                  "text-[11px] font-semibold",
                  isLiked
                    ? "text-red-600"
                    : "text-gray-500"
                )}
              >
                {likeCount}
              </span>
            </button>

            {/* Comments */}
            <button
              type="button"
              onClick={handleCommentsToggle}
              title={
                showComments
                  ? "Hide comments"
                  : "Show comments"
              }
              aria-label={
                showComments
                  ? "Hide comments"
                  : "Show comments"
              }
              className={cn(
                "flex w-14 flex-col items-center gap-1 rounded-lg p-2.5 transition",
                showComments
                  ? "bg-primary/10 text-primary"
                  : "text-gray-400 hover:bg-gray-50 hover:text-primary"
              )}
            >
              <AiOutlineComment className="h-5 w-5" />

              <span
                className={cn(
                  "text-[11px] font-semibold",
                  showComments
                    ? "text-primary"
                    : "text-gray-500"
                )}
              >
                {commentCount}
              </span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={handleBookmark}
              disabled={isSaving}
              title={
                isBookmarked
                  ? "Remove bookmark"
                  : "Bookmark"
              }
              aria-label={
                isBookmarked
                  ? "Remove bookmark"
                  : "Bookmark"
              }
              className={cn(
                "flex w-14 flex-col items-center gap-1 rounded-lg p-2.5 transition",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isBookmarked
                  ? "bg-primary/10 text-primary"
                  : "text-gray-400 hover:bg-gray-50 hover:text-primary"
              )}
            >
              {isBookmarked ? (
                <LuBookmarkCheck className="h-5 w-5" />
              ) : (
                <LuBookmark className="h-5 w-5" />
              )}
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={
                handleShare
              }
              title="Share"
              aria-label="Share article"
              className="flex w-14 flex-col items-center gap-1 rounded-lg p-2.5 text-gray-400 transition hover:bg-gray-50 hover:text-primary"
            >
              <AiOutlineShareAlt className="h-5 w-5" />
            </button>

            {/* More */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowMoreMenu(
                    (previous) =>
                      !previous
                  )
                }
                title="More options"
                aria-label="More article options"
                className="flex w-14 flex-col items-center gap-1 rounded-lg p-2.5 text-gray-400 transition hover:bg-gray-50 hover:text-primary"
              >
                <HiOutlineEllipsisHorizontal className="h-5 w-5" />
              </button>

              {showMoreMenu && (
                <div className="absolute left-16 top-0 z-50 min-w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                  {isAuthor ? (
                    <>
                      <button
                        type="button"
                        onClick={
                          handleEdit
                        }
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Edit Article
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);

                          void handleDelete();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete Article
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setShowMoreMenu(false)
                        }
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Report Article
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowMoreMenu(false)
                        }
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Block Author
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Article header */}
          <header className="space-y-5">
            <h1 className="wrap-break-word text-4xl font-black leading-tight tracking-tight text-gray-900 sm:text-5xl">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="max-w-2xl wrap-break-word text-base leading-7 text-gray-600">
                {article.excerpt}
              </p>
            )}

            {/* Tags */}
            {article.tagNames &&
              article.tagNames.length >
              0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tagNames.map(
                    (tag) => (
                      <Tag
                        key={tag}
                        variant="outline"
                        size="sm"
                      >
                        {tag}
                      </Tag>
                    )
                  )}
                </div>
              )}
          </header>

          {/* Author */}
          <div className="my-6 flex items-center justify-between border-y border-gray-200 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                src={resolvedAuthorAvatar}
                alt={resolvedAuthorName}
                href={authorProfileUrl}
                name={resolvedAuthorName}
                size="md"
                className="h-11 w-11"
              />

              <div className="min-w-0">
                <Link
                  to={authorProfileUrl}
                  className="truncate text-sm font-semibold text-gray-900 hover:text-primary hover:underline"
                >
                  {resolvedAuthorUsername}
                </Link>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>
                    {formattedDate}
                  </span>

                  <span>
                    ·
                  </span>

                  <span className="flex items-center gap-1">
                    <LuClock className="h-3 w-3" />

                    {readingTime}{" "}
                    min read
                  </span>
                </div>
              </div>
            </div>

            {!isAuthor &&
              article.authorId && (
                <Button
                  variant={
                    isFollowing
                      ? "secondary"
                      : "primary"
                  }
                  size="sm"
                  isLoading={isFollowLoading}
                  onClick={
                    handleFollowToggle
                  }
                  className="ml-4 shrink-0 rounded-lg font-semibold"
                >
                  {isFollowing
                    ? "Following"
                    : "Follow"}
                </Button>
              )}
          </div>

          {/* Cover image */}
          {coverImage && (
            <div className="mb-8 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <img
                src={coverImage}
                alt={article.title}
                className="h-auto max-h-125 w-full object-cover"
              />
            </div>
          )}

          {/* Article content */}
          <article
            ref={articleRef}
            className="w-full max-w-none wrap-break-word prose prose-sm sm:prose-base prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight prose-headings:break-words prose-headings:mt-8 prose-headings:mb-4 prose-p:text-gray-700 prose-p:leading-7 prose-p:break-words prose-a:text-primary prose-a:no-underline prose-a:break-words hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-primary prose-blockquote:text-gray-600 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-gray-800 prose-code:break-words prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-gray-900 prose-pre:p-5 prose-li:text-gray-700 prose-li:break-words prose-img:max-w-full prose-img:h-auto prose-img:rounded-xl prose-img:shadow-sm"
          >
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
              ]}
            >
              {article.content}
            </ReactMarkdown>
          </article>

          {/* Mobile actions */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto border-t border-gray-200 py-4 lg:hidden">
            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 transition",
                isLiked
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {isLiked ? (
                <AiFillHeart className="h-5 w-5" />
              ) : (
                <AiOutlineHeart className="h-5 w-5" />
              )}

              <span className="text-sm font-semibold">
                {likeCount}
              </span>
            </button>

            {/* Comments */}
            <button
              type="button"
              onClick={handleCommentsToggle}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 transition",
                showComments
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              <AiOutlineComment className="h-5 w-5" />

              <span className="text-sm font-semibold">
                {commentCount}
              </span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={handleBookmark}
              disabled={isSaving}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 transition",
                isBookmarked
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {isBookmarked ? (
                <LuBookmarkCheck className="h-5 w-5" />
              ) : (
                <LuBookmark className="h-5 w-5" />
              )}
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 transition hover:bg-gray-50"
            >
              <AiOutlineShareAlt className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile comments */}
          {showComments && (
            <div
              id="comments-section"
              className="mt-8 border-t border-gray-200 pt-8 lg:hidden"
            >
              <ArticleComments
                articleId={article.id}
                initialCommentCount={commentCount}
                onCommentCountChange={setCommentCount}
              />
            </div>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:gap-8 xl:w-96">
          <div className="sticky top-8 flex flex-col gap-8">
            {/* Author Card */}
            <AuthorCard
              authorId={article.authorId}
              authorName={resolvedAuthorName}
              authorAvatar={resolvedAuthorAvatar}
              isAuthor={isAuthor}
              articlesCount={authorProfile?.articlesCount}
            />

            {/* Related articles */}
            <RelatedArticles
              currentArticleId={article.id}
            />

            {/* Desktop comments */}
            {showComments && (
              <div
                id="comments-section"
                className="border-t border-gray-200 pt-8"
              >
                <ArticleComments
                  articleId={
                    article.id
                  }
                  initialCommentCount={
                    commentCount
                  }
                  onCommentCountChange={
                    setCommentCount
                  }
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  </div>
);
}

export default ArticleDetailsPage;
