import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getFeedArticles, likeArticle, saveArticle } from "@/features/articles/api/articleApi";
import { toast } from "@/shared/hooks/useToast";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";
import { getApiErrorMessage } from "@/shared/lib/utils/apiError";
import { type DisplayArticle, mapArticle } from "@/features/articles/utils/articleListMappers";

/** Article list: feed tabs, search, tag filter, layout, paging and like/save. */
export function useArticlesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Show the floating arrow once the layout's scroll container is scrolled a bit
  useEffect(() => {
    let scroller: HTMLElement | null = topRef.current?.parentElement ?? null;
    while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) {
      scroller = scroller.parentElement;
    }
    const target: HTMLElement | Window = scroller ?? window;
    const getTop = (): number => (scroller ? scroller.scrollTop : window.scrollY);

    const onScroll = (): void => setShowScrollTop(getTop() > 400);
    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>("");
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
      } catch (err: unknown) {
        if (isSubscribed) {
          setArticles([]);
          toast.error(getApiErrorMessage(err, "Failed to load articles. Please try again later."));
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
    } catch (err: unknown) {
      setLoadMoreError(getApiErrorMessage(err, "Failed to load more articles."));
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

  const requireAuth = useRequireAuth();

  const toggleBookmark = async (id: string) => {
    if (!requireAuth("save this article")) return;
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
    } catch (err: unknown) {
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
      toast.error(getApiErrorMessage(err, "Failed to update bookmark"));
    }
  };

  const handleLike = async (articleId: string): Promise<void> => {
    if (!requireAuth("like this article")) return;
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
    } catch (err: unknown) {
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
      toast.error(getApiErrorMessage(err, "Failed to update like status"));
    }
  };

  const selectedCategory = searchParams.get("tag") || "All";

  const setSelectedCategory = useCallback(
    (update: string | ((prev: string) => string)) => {
      setSearchParams(
        (prev) => {
          const current = prev.get("tag") || "All";
          const next = typeof update === "function" ? update(current) : update;
          const params = new URLSearchParams(prev);
          if (!next || next === "All") {
            params.delete("tag");
          } else {
            params.set("tag", next);
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

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

  return {
    searchParams,
    setSearchParams,
    articles,
    setArticles,
    isLoading,
    setIsLoading,
    isLoadingMore,
    setIsLoadingMore,
    loadMoreError,
    setLoadMoreError,
    page,
    setPage,
    hasNextPage,
    setHasNextPage,
    showScrollTop,
    setShowScrollTop,
    searchQuery,
    setSearchQuery,
    isDropdownOpen,
    setIsDropdownOpen,
    bookmarkedIds,
    setBookmarkedIds,
    layout,
    setLayout,
    navigate,
    sentinelRef,
    topRef,
    PAGE_SIZE,
    loadMore,
    requireAuth,
    toggleBookmark,
    handleLike,
    selectedCategory,
    setSelectedCategory,
    filteredArticles,
  };
}

export type UseArticlesListResult = ReturnType<typeof useArticlesList>;
