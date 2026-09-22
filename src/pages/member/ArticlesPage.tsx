import { useState, useEffect, useMemo, useRef, useCallback, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineSearch } from "react-icons/md";
import { LuPenLine, LuLayoutGrid, LuLayoutList, LuX } from "react-icons/lu";
import { Button, Input, Skeleton } from "@/components/common";
import { getFeedArticles, likeArticle, saveArticle } from "@/features/articles/api/articleApi";
import type { Article } from "@/features/articles/api/articleApi";
import { ArticleCard } from "@/features/articles/components/ArticleCard";
import { ArticleSearchDropdown } from "@/features/articles/components/ArticleSearchDropdown";
import { toast } from "@/hooks/useToast";

interface DisplayArticle {
  id: string;
  authorId?: string;
  title: string;
  excerpt: string;
  tagNames: string[];
  category?: string;
  coverImage?: string;
  status?: "draft" | "published" | "scheduled" | "archived";
  authorInfo?: string[];
  authorName?: string;
  authoruserName?: string;
  authorAvatar?: string;
  authorRole?: string;
  createdAt: string;
  readTimeMinutes?: number;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

function getArticleAuthor(art: Article): { name: string; userName: string; avatar?: string } {
  if (art.author && typeof art.author === "object") {
    const a = art.author;
    const name =(a.userName && a.userName.trim()) || (a.name && a.name.trim());
    if (name) {
      return {
        name,
        avatar: a.avatarUrl || undefined,
        userName: a.userName as string
      };
    }
  }
  if (typeof art.authorName === "string" && art.authorName.trim()) {
    return {
      name: art.authorName.trim(),
      avatar: undefined,
      userName: "" as string
    };
  }
  return { name: "DevSpace Author", userName: "devspace", avatar: undefined };
}

function mapArticle(art: Article): DisplayArticle {
  const { name: authoruserName, avatar: authorAvatar } = getArticleAuthor(art);
  const raw = art as unknown as Record<string, unknown>;

  const likeCount =
    typeof raw.likeCount === "number"
      ? raw.likeCount
      : typeof raw.likes === "number"
        ? raw.likes
        : typeof art.likeCount === "number"
          ? art.likeCount
          : typeof art.likes === "number"
            ? art.likes
            : 0;

  const isLiked =
    typeof raw.liked === "boolean"
      ? raw.liked
      : typeof raw.isLiked === "boolean"
        ? raw.isLiked
        : Boolean(art.liked ?? art.isLiked);

  const commentCount =
    typeof raw.commentCount === "number"
      ? raw.commentCount
      : typeof raw.comments === "number"
        ? raw.comments
        : typeof art.commentCount === "number"
          ? art.commentCount
          : typeof art.comments === "number"
            ? art.comments
            : 0;

  const isSaved = Boolean(
    raw.saved ??
    raw.isBookmarked ??
    raw.isSaved ??
    art.saved ??
    art.isBookmarked,
  );

  return {
    id: art.id,
    authorId: art.author?.id || art.authorId,
    title: art.title || "Untitled Article",
    excerpt: art.excerpt || art.content || "",
    tagNames: (() => {
      const rawTags = (art.tags && art.tags.length > 0 ? art.tags : art.tagNames) || [];
      return rawTags
        .map((t: unknown) =>
          typeof t === "string"
            ? t
            : t && typeof t === "object" && "name" in t
              ? String((t as { name: unknown }).name)
              : "",
        )
        .filter(Boolean);
    })(),
    category: art.series || "General",
    coverImage: art.coverImageUrl || art.coverImage,
    status: art.status as DisplayArticle["status"],
    authoruserName,
    authorAvatar: authorAvatar || (art as unknown as { authorAvatar?: string }).authorAvatar,
    authorRole: undefined,
    createdAt: art.createdAt || new Date().toISOString(),
    readTimeMinutes:
      art.readingTimeMinutes ??
      art.readingTime ??
      Math.max(1, Math.ceil((art.content?.length || 0) / 500)),
    likes: likeCount,
    comments: commentCount,
    isLiked,
    isBookmarked: isSaved,
  };
}

export function ArticlesPage(): JSX.Element {
  const navigate = useNavigate();

  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [layout, setLayout] = useState<"list" | "grid">("list");

  const PAGE_SIZE = 10;

  // Initial feed load
  useEffect(() => {
    let isSubscribed = true;

    async function loadInitialFeed(): Promise<void> {
      try {
        setIsLoading(true);
        const response = await getFeedArticles({
          page: 1,
          pageSize: PAGE_SIZE,
        });

        if (!isSubscribed) return;

        const rawArticles = response.data || [];

        if (response.pagination) {
          if (typeof response.pagination.hasNext === "boolean") {
            setHasNextPage(response.pagination.hasNext);
          } else if (typeof response.pagination.totalPages === "number") {
            setHasNextPage(1 < response.pagination.totalPages);
          } else {
            setHasNextPage(rawArticles.length >= PAGE_SIZE);
          }
        } else {
          setHasNextPage(rawArticles.length >= PAGE_SIZE);
        }

        const sortedData = [...rawArticles].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        const initialArticles = sortedData.map(mapArticle);
        setArticles(initialArticles);
        setPage(1);

        const initialBookmarked = new Set<string>();
        initialArticles.forEach((art) => {
          if (art.isBookmarked) {
            initialBookmarked.add(art.id);
          }
        });
        if (initialBookmarked.size > 0) {
          setBookmarkedIds(initialBookmarked);
        }
      } catch {
        if (isSubscribed) {
          setArticles([]);
          toast.error("Failed to load articles. Please try again later.");
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialFeed();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Fetch next page for endless scroll
  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasNextPage || isLoading || isLoadingMore) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const response = await getFeedArticles({
        page: nextPage,
        pageSize: PAGE_SIZE,
      });

      const rawArticles = response.data || [];

      if (response.pagination) {
        if (typeof response.pagination.hasNext === "boolean") {
          setHasNextPage(response.pagination.hasNext);
        } else if (typeof response.pagination.totalPages === "number") {
          setHasNextPage(nextPage < response.pagination.totalPages);
        } else {
          setHasNextPage(rawArticles.length >= PAGE_SIZE);
        }
      } else {
        setHasNextPage(rawArticles.length >= PAGE_SIZE);
      }

      const sortedData = [...rawArticles].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      const newDisplayArticles = sortedData.map(mapArticle);

      setArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const uniqueNew = newDisplayArticles.filter((a) => !existingIds.has(a.id));
        return [...prev, ...uniqueNew];
      });

      setPage(nextPage);

      const newlyBookmarked = new Set<string>();
      newDisplayArticles.forEach((art) => {
        if (art.isBookmarked) {
          newlyBookmarked.add(art.id);
        }
      });
      if (newlyBookmarked.size > 0) {
        setBookmarkedIds((prev) => new Set([...prev, ...newlyBookmarked]));
      }
    } catch {
      setLoadMoreError("Failed to load more articles.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasNextPage, isLoading, isLoadingMore, page]);

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!hasNextPage || isLoading || isLoadingMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          void loadMore();
        }
      },
      {
        rootMargin: "300px",
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isLoading, isLoadingMore, loadMore]);

  const toggleBookmark = async (id: string) => {
    const isCurrentlyBookmarked = bookmarkedIds.has(id);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyBookmarked) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next; 
    });

    try {
      await saveArticle(id);
      if (isCurrentlyBookmarked) {
        toast.success("Removed from bookmarks");
      } else {
        toast.success("Saved to bookmarks");
      }
    } catch {
      // Revert on failure
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
      toast.error("Failed to update bookmark");
    }
  };

  const handleLike = async (articleId: string): Promise<void> => {
    const target = articles.find((a) => a.id === articleId);
    if (!target) return;

    const wasLiked = Boolean(target.isLiked);
    const prevLikes = target.likes ?? 0;
    const newLikes = Math.max(0, prevLikes + (wasLiked ? -1 : 1));

    // Immediate optimistic update
    setArticles((prev) =>
      prev.map((art) =>
        art.id === articleId
          ? {
              ...art,
              isLiked: !wasLiked,
              likes: newLikes,
            }
          : art,
      ),
    );

    try {
      await likeArticle(articleId);
    } catch {
      // Revert on failure
      setArticles((prev) =>
        prev.map((art) =>
          art.id === articleId
            ? {
                ...art,
                isLiked: wasLiked,
                likes: prevLikes,
              }
            : art,
        ),
      );
      toast.error("Failed to update like status");
    }
  };

  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return articles.filter((art) => {
      const matchesSearch =
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.tagNames.some((t) => t.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "All" ||
        art.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        art.tagNames.some((t) => t.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight">
            Technical Articles
          </h1>
          <p className="text-text/60 text-sm">
            Curated guides, architectural insights, and tutorials written by developers.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<LuPenLine className="w-4 h-4" />}
          onClick={() => navigate("/articles/new")}
          className="shrink-0 font-semibold w-full sm:w-auto"
        >
          Write Article
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search container with 2-column dropdown */}
          <div className="relative flex-1 max-w-xl">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onClick={() => setIsDropdownOpen(true)}
              placeholder="Search by keyword, tag, or topic..."
              inputSize="md"
              leftIcon={<MdOutlineSearch className="text-text/40 text-lg" />}
              rightIcon={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                    }}
                    className="p-1 text-text/40 hover:text-text cursor-pointer transition-colors"
                    title="Clear search"
                  >
                    <LuX className="w-4 h-4" />
                  </button>
                ) : undefined
              }
              className="bg-white border-border shadow-2xs"
            />

            <ArticleSearchDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              searchQuery={searchQuery}
              selectedTag={selectedCategory}
              onSelectTag={(tagName) => {
                setSelectedCategory(tagName);
                setSearchQuery("");
                setIsDropdownOpen(false);
              }}
              onSelectTopic={(topic) => {
                setIsDropdownOpen(false);
                navigate(`/articles/${topic.id}`);
              }}
            />
          </div>

          {/* Layout toggle */}
          <div className="flex items-center bg-white border border-border rounded-lg overflow-hidden shrink-0 self-end sm:self-auto shadow-2xs">
            <button
              type="button"
              id="layout-list"
              onClick={() => setLayout("list")}
              title="List view"
              className={`p-2 transition-colors cursor-pointer ${
                layout === "list"
                  ? "bg-primary text-white"
                  : "text-text/50 hover:bg-slate-50 hover:text-text"
              }`}
            >
              <LuLayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="layout-grid"
              onClick={() => setLayout("grid")}
              title="Grid view"
              className={`p-2 transition-colors cursor-pointer ${
                layout === "grid"
                  ? "bg-primary text-white"
                  : "text-text/50 hover:bg-slate-50 hover:text-text"
              }`}
            >
              <LuLayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active tag filter indicator */}
        {selectedCategory !== "All" && (
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-xs text-text/50 font-medium">Filtered by tag:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-[0_0_12px_rgba(99,102,241,0.6)]">
              #{selectedCategory}
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className="hover:text-white/80 p-0.5 rounded-full cursor-pointer ml-0.5"
                title="Clear tag filter"
              >
                <LuX className="w-3.5 h-3.5" />
              </button>
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className="text-xs text-text/50 hover:text-primary transition-colors cursor-pointer underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Loading skeletons */}
      {isLoading ? (
        layout === "list" ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-border rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Skeleton variant="circular" width={36} height={36} />
                  <div className="space-y-1">
                    <Skeleton variant="text" width={120} height={14} />
                    <Skeleton variant="text" width={160} height={12} />
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-5">
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="85%" height={20} />
                    <Skeleton variant="text" width="100%" height={14} />
                    <Skeleton variant="text" width="70%" height={14} />
                    <div className="flex gap-2 pt-1">
                      <Skeleton variant="rounded" width={60} height={22} />
                      <Skeleton variant="rounded" width={60} height={22} />
                    </div>
                  </div>
                  <Skeleton
                    variant="rounded"
                    width={176}
                    height={112}
                    className="hidden sm:block shrink-0"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs"
              >
                <Skeleton variant="rectangular" width="100%" height={180} />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton variant="circular" width={28} height={28} />
                    <Skeleton variant="text" width={100} height={12} />
                  </div>
                  <Skeleton variant="text" width="90%" height={16} />
                  <Skeleton variant="text" width="100%" height={12} />
                  <Skeleton variant="text" width="60%" height={12} />
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredArticles.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white border border-border rounded-2xl text-center p-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <LuPenLine className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-bold text-text">No articles found</h3>
            <p className="text-xs text-text/60">
              {searchQuery || selectedCategory !== "All"
                ? "Nothing matched your search or filter. Try clearing them."
                : "No articles have been published yet. Be the first to write one!"}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            {(searchQuery || selectedCategory !== "All") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<LuPenLine className="w-4 h-4" />}
              onClick={() => navigate("/articles/new")}
            >
              Write Article
            </Button>
          </div>
        </div>
      ) : (
        <>
          {layout === "list" ? (
            /* Feed list */
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  authorId={article.authorId}
                  title={article.title}
                  excerpt={article.excerpt}
                  tagNames={article.tagNames}
                  selectedTag={selectedCategory}
                  onTagClick={(tag) =>
                    setSelectedCategory((prev) =>
                      prev.toLowerCase() === tag.toLowerCase() ? "All" : tag,
                    )
                  }
                  coverImage={article.coverImage}
                  authorName={article.authoruserName}
                  authorAvatar={article.authorAvatar}
                  authorRole={article.authorRole}
                  createdAt={article.createdAt}
                  readTimeMinutes={article.readTimeMinutes}
                  likes={article.likes}
                  comments={article.comments}
                  isLiked={article.isLiked}
                  isBookmarked={bookmarkedIds.has(article.id)}
                  onBookmark={() => toggleBookmark(article.id)}
                  onLike={handleLike}
                  variant="horizontal"
                />
              ))}
            </div>
          ) : (
            /* Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  authorId={article.authorId}
                  title={article.title}
                  excerpt={article.excerpt}
                  tagNames={article.tagNames}
                  selectedTag={selectedCategory}
                  onTagClick={(tag) =>
                    setSelectedCategory((prev) =>
                      prev.toLowerCase() === tag.toLowerCase() ? "All" : tag,
                    )
                  }
                  coverImage={article.coverImage}
                  authorName={article.authoruserName}
                  authorAvatar={article.authorAvatar}
                  authorRole={article.authorRole}
                  createdAt={article.createdAt}
                  readTimeMinutes={article.readTimeMinutes}
                  likes={article.likes}
                  comments={article.comments}
                  isLiked={article.isLiked}
                  isBookmarked={bookmarkedIds.has(article.id)}
                  onBookmark={() => toggleBookmark(article.id)}
                  onLike={handleLike}
                  variant="vertical"
                />
              ))}
            </div>
          )}

          {/* Endless Scroll Sentinel & Indicators */}
          <div className="pt-4">
            <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />

            {isLoadingMore && (
              <div className="py-6 flex flex-col items-center justify-center space-y-2 text-text/70">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Loading more articles...</span>
                </div>
              </div>
            )}

            {loadMoreError && !isLoadingMore && (
              <div className="py-6 flex flex-col items-center justify-center space-y-2">
                <p className="text-xs text-rose-500">{loadMoreError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadMore()}
                >
                  Retry Loading
                </Button>
              </div>
            )}

            {!hasNextPage && !isLoading && (
              <div className="py-8 flex items-center justify-center gap-3 text-xs text-text/50">
                <div className="h-px w-16 bg-border" />
                <span>You're all caught up!</span>
                <div className="h-px w-16 bg-border" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ArticlesPage;
