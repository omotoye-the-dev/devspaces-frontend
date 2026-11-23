import { useState, useEffect, useCallback, useMemo, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { ResourceItem } from "@/features/resources/components/ResourceCard";
import {
  getResources,
  getResourceCategories,
  voteResource,
  saveResource,
} from "@/features/resources/api/resources.api";
import { calculateVoteTransition, applyVoteResponse } from "@/features/resources/utils/voteHelper";
import type { ResourceListItem } from "@/features/resources/types/resources.types";
import { getApiErrorMessage } from "@/shared/lib/utils/apiError";
import { toast } from "@/shared/hooks/useToast";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";
import type { ResourceCounts } from "@/features/resources/utils/liveUpdate";
import {
  CATEGORY_PARAM_MAP,
  SORT_PARAM_MAP,
} from "@/features/resources/constants/resourceListOptions";

/** Resources list: category/sort/search filters, paging, live counts, voting, saving and the add/detail modals. */
export function useResourcesList() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("most_upvoted");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when category or sort changes
  const handleSelectCategory = (categoryId: string): void => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleSelectSort = (sortValue: string): void => {
    setSortBy(sortValue);
    setPage(1);
  };

  // Patch live count updates from SignalR into the resource list state
  const handleLiveCounts = useCallback((id: string, counts: ResourceCounts): void => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...counts } : r)));
  }, []);

  const [refreshKey, setRefreshKey] = useState<number>(0);

  const filterKey = `${selectedCategory}-${sortBy}-${debouncedSearch}-${page}-${refreshKey}`;
  const [prevFilterKey, setPrevFilterKey] = useState<string>(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setIsLoading(true);
    setError(null);
  }

  // Fetch category counts
  useEffect(() => {
    let isMounted = true;

    async function loadCategoryCounts(): Promise<void> {
      try {
        const res = await getResourceCategories();
        if (isMounted && Array.isArray(res.data)) {
          const counts: Record<string, number> = {
            all: 0,
            courses: 0,
            course: 0,
            documentation: 0,
            documentations: 0,
            books: 0,
            book: 0,
            videos: 0,
            video: 0,
            repositories: 0,
            repository: 0,
            tools: 0,
            tool: 0,
          };
          let total = 0;
          res.data.forEach((cat) => {
            const key = cat.name.toLowerCase();
            total += cat.count;

            counts[key] = cat.count;

            if (key === "repository" || key === "repositories") {
              counts["repositories"] = cat.count;
              counts["repository"] = cat.count;
            } else if (key === "course" || key === "courses") {
              counts["courses"] = cat.count;
              counts["course"] = cat.count;
            } else if (key === "documentation" || key === "documentations") {
              counts["documentation"] = cat.count;
              counts["documentations"] = cat.count;
            } else if (key === "book" || key === "books") {
              counts["books"] = cat.count;
              counts["book"] = cat.count;
            } else if (key === "video" || key === "videos") {
              counts["videos"] = cat.count;
              counts["video"] = cat.count;
            } else if (key === "tool" || key === "tools") {
              counts["tools"] = cat.count;
              counts["tool"] = cat.count;
            } else {
              counts[`${key}s`] = cat.count;
            }
          });
          counts["all"] = total;
          setCategoryCounts(counts);
        }
      } catch {
        // Non-critical background enhancement
      }
    }

    void loadCategoryCounts();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // Fetch resources feed
  useEffect(() => {
    let isMounted = true;

    async function loadResources(): Promise<void> {
      try {
        const categoryParam = CATEGORY_PARAM_MAP[selectedCategory.toLowerCase()];
        const sortByParam = SORT_PARAM_MAP[sortBy] ?? "upvotes";

        const res = await getResources({
          page,
          pageSize: 12,
          search: debouncedSearch.trim() || undefined,
          category: categoryParam || undefined,
          sortBy: sortByParam,
        });

        if (isMounted) {
          setResources(res.data || []);
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages || 1);
            setTotalCount(res.pagination.totalCount || 0);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(getApiErrorMessage(err, "Failed to load resources."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadResources();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, sortBy, debouncedSearch, page, refreshKey]);

  // Sort the loaded page client-side so a sort change reorders instantly,
  // before the server refetch lands (and live count updates keep order correct).
  const sortedResources = useMemo<ResourceListItem[]>(() => {
    const byDateDesc = (a: ResourceListItem, b: ResourceListItem): number =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    const comparators: Record<string, (a: ResourceListItem, b: ResourceListItem) => number> = {
      most_upvoted: (a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0),
      most_recent: byDateDesc,
      most_downloaded: (a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0),
      most_saved: (a, b) => (b.saveCount ?? 0) - (a.saveCount ?? 0),
    };

    const compare = comparators[sortBy] ?? comparators.most_upvoted;
    return [...resources].sort((a, b) => compare(a, b) || byDateDesc(a, b));
  }, [resources, sortBy]);

  // Upvoting handler (action 0)
  const requireAuth = useRequireAuth();

  const handleUpvote = async (id: string, e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    if (!requireAuth("upvote this resource")) return;
    e.stopPropagation();
    const target = resources.find((r) => r.id === id);
    if (!target) return;

    const currentVoteState = {
      upvoteCount: target.upvoteCount ?? 0,
      downvoteCount: target.downvoteCount ?? 0,
      isUpvotedByMe: Boolean(target.isUpvotedByMe),
      isDownvotedByMe: Boolean(target.isDownvotedByMe),
    };

    const transition = calculateVoteTransition(currentVoteState, 0);
    if (!transition.allowed) {
      if (transition.reason) {
        toast.info(transition.reason);
      }
      return;
    }

    // Optimistic update
    setResources((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isUpvotedByMe: transition.optimisticState.isUpvotedByMe,
              isDownvotedByMe: transition.optimisticState.isDownvotedByMe,
              upvoteCount: transition.optimisticState.upvoteCount,
              downvoteCount: transition.optimisticState.downvoteCount,
            }
          : r,
      ),
    );

    try {
      const res = await voteResource(id, 0);
      const reconciled = applyVoteResponse(transition.optimisticState, res.data);
      setResources((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                isUpvotedByMe: reconciled.isUpvotedByMe,
                isDownvotedByMe: reconciled.isDownvotedByMe,
                upvoteCount: reconciled.upvoteCount,
                downvoteCount: reconciled.downvoteCount,
              }
            : r,
        ),
      );
    } catch (err: unknown) {
      // Rollback
      setResources((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                isUpvotedByMe: currentVoteState.isUpvotedByMe,
                isDownvotedByMe: currentVoteState.isDownvotedByMe,
                upvoteCount: currentVoteState.upvoteCount,
                downvoteCount: currentVoteState.downvoteCount,
              }
            : r,
        ),
      );
      toast.error(getApiErrorMessage(err, "Failed to record vote"));
    }
  };

  // Downvoting handler (action 1)
  const handleDownvote = async (id: string, e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    if (!requireAuth("downvote this resource")) return;
    e.stopPropagation();
    const target = resources.find((r) => r.id === id);
    if (!target) return;

    const currentVoteState = {
      upvoteCount: target.upvoteCount ?? 0,
      downvoteCount: target.downvoteCount ?? 0,
      isUpvotedByMe: Boolean(target.isUpvotedByMe),
      isDownvotedByMe: Boolean(target.isDownvotedByMe),
    };

    const transition = calculateVoteTransition(currentVoteState, 1);
    if (!transition.allowed) {
      if (transition.reason) {
        toast.info(transition.reason);
      }
      return;
    }

    // Optimistic update
    setResources((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isUpvotedByMe: transition.optimisticState.isUpvotedByMe,
              isDownvotedByMe: transition.optimisticState.isDownvotedByMe,
              upvoteCount: transition.optimisticState.upvoteCount,
              downvoteCount: transition.optimisticState.downvoteCount,
            }
          : r,
      ),
    );

    try {
      const res = await voteResource(id, 1);
      const reconciled = applyVoteResponse(transition.optimisticState, res.data);
      setResources((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                isUpvotedByMe: reconciled.isUpvotedByMe,
                isDownvotedByMe: reconciled.isDownvotedByMe,
                upvoteCount: reconciled.upvoteCount,
                downvoteCount: reconciled.downvoteCount,
              }
            : r,
        ),
      );
    } catch (err: unknown) {
      // Rollback
      setResources((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                isUpvotedByMe: currentVoteState.isUpvotedByMe,
                isDownvotedByMe: currentVoteState.isDownvotedByMe,
                upvoteCount: currentVoteState.upvoteCount,
                downvoteCount: currentVoteState.downvoteCount,
              }
            : r,
        ),
      );
      toast.error(getApiErrorMessage(err, "Failed to record downvote"));
    }
  };

  // Optimistic save / bookmark
  const handleBookmark = async (id: string, e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    if (!requireAuth("save this resource")) return;
    e.stopPropagation();
    const target = resources.find((r) => r.id === id);
    if (!target) return;

    const nextSaved = !target.isSavedByMe;

    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, isSavedByMe: nextSaved } : r)));

    try {
      await saveResource(id, nextSaved);
      toast.success(nextSaved ? "Saved to your bookmarks" : "Removed from bookmarks");
    } catch (err: unknown) {
      // Rollback
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isSavedByMe: !nextSaved } : r)),
      );
      toast.error(getApiErrorMessage(err, "Failed to update saved status"));
    }
  };

  const handleOpenAddResource = (): void => {
    if (requireAuth("add a resource")) setIsModalOpen(true);
  };

  const handleCardClick = (cardItem: ResourceItem): void => {
    navigate(`/resources/${cardItem.id}`);
  };

  const handleVoteChangeFromModal = (
    resId: string,
    isUpvoted: boolean,
    newCount: number,
    isDownvoted?: boolean,
    newDownvoteCount?: number,
  ): void => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === resId
          ? {
              ...r,
              isUpvotedByMe: isUpvoted,
              upvoteCount: newCount,
              ...(isDownvoted !== undefined ? { isDownvotedByMe: isDownvoted } : {}),
              ...(newDownvoteCount !== undefined ? { downvoteCount: newDownvoteCount } : {}),
            }
          : r,
      ),
    );
  };

  const handleSaveChangeFromModal = (resId: string, isSaved: boolean): void => {
    setResources((prev) => prev.map((r) => (r.id === resId ? { ...r, isSavedByMe: isSaved } : r)));
  };

  const handleCreateSuccess = (): void => {
    setRefreshKey((k) => k + 1);
  };

  const handleClearFilters = (): void => {
    setSelectedCategory("all");
    setSearchQuery("");
    setDebouncedSearch("");
    setSortBy("most_upvoted");
    setPage(1);
  };

  return {
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    setDebouncedSearch,
    page,
    setPage,
    totalPages,
    setTotalPages,
    totalCount,
    setTotalCount,
    resources,
    setResources,
    categoryCounts,
    setCategoryCounts,
    isLoading,
    setIsLoading,
    error,
    setError,
    isModalOpen,
    setIsModalOpen,
    selectedDetailId,
    setSelectedDetailId,
    refreshKey,
    setRefreshKey,
    prevFilterKey,
    setPrevFilterKey,
    navigate,
    handleSelectCategory,
    handleSelectSort,
    handleLiveCounts,
    filterKey,
    sortedResources,
    requireAuth,
    handleUpvote,
    handleDownvote,
    handleBookmark,
    handleOpenAddResource,
    handleCardClick,
    handleVoteChangeFromModal,
    handleSaveChangeFromModal,
    handleCreateSuccess,
    handleClearFilters,
  };
}

export type UseResourcesListResult = ReturnType<typeof useResourcesList>;
