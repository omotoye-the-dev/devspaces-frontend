import { useState, useEffect, type JSX, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Select,
  EmptyState,
  Skeleton,
  type SelectOption,
} from "@/components/common";
import { MdOutlineSearch, MdClear } from "react-icons/md";
import { FiFolder, FiChevronLeft, FiChevronRight, FiRefreshCw } from "react-icons/fi";
import { ResourceSidebar } from "@/features/resources/components/ResourceSidebar";
import { CategoryPills } from "@/features/resources/components/CategoryPills";
import { AddResourceModal } from "@/features/resources/components/AddResourceModal";
import { ResourceCard, type ResourceItem } from "@/features/resources/components/ResourceCard";
import { ResourceDetailModal } from "@/features/resources/components/ResourceDetailModal";
import {
  getResources,
  getResourceCategories,
  voteResource,
  saveResource,
} from "@/features/resources/api/resources.api";
import type { ResourceListItem } from "@/types/resources.types";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { toast } from "@/hooks/useToast";

const SORT_OPTIONS: SelectOption[] = [
  { label: "Sort by: Most Upvoted", value: "most_upvoted" },
  { label: "Sort by: Most Recent", value: "most_recent" },
  { label: "Sort by: Most Downloaded", value: "most_downloaded" },
  { label: "Sort by: Most Saved", value: "most_saved" },
];

const CATEGORY_PARAM_MAP: Record<string, string> = {
  all: "",
  courses: "Course",
  documentation: "Documentation",
  books: "Book",
  videos: "Video",
  repositories: "Repository",
  tools: "Tool",
};

const SORT_PARAM_MAP: Record<string, string> = {
  most_upvoted: "upvotes",
  most_recent: "newest",
  most_downloaded: "downloads",
  most_saved: "saves",
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function mapToResourceCardItem(item: ResourceListItem): ResourceItem {
  const upvotes = item.upvoteCount ?? 0;
  const isUpvoted = Boolean(item.isUpvotedByMe) && upvotes > 0;
  const isDownvoted = Boolean(item.isDownvotedByMe);

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    icon: item.logoUrl || undefined,
    url: item.externalUrl || undefined,
    tags: (item.tags || []).map((t) => (typeof t === "string" ? t : t.name)),
    author: {
      id: item.uploader?.userId,
      name: item.uploader?.name || item.uploader?.username || "DevSpace Contributor",
      avatarUrl: item.uploader?.avatarUrl || undefined,
    },
    updatedAt: formatDate(item.createdAt),
    upvotesCount: upvotes,
    downvotesCount: item.downvoteCount ?? 0,
    isUpvoted,
    isDownvoted,
    isBookmarked: item.isSavedByMe,
  };
}

export default function ResourcesPage(): JSX.Element {
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

  // Optimistic upvoting
  const handleUpvote = async (id: string, e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.stopPropagation();
    const target = resources.find((r) => r.id === id);
    if (!target) return;

    const wasUpvoted = Boolean(target.isUpvotedByMe) && (target.upvoteCount ?? 0) > 0;
    const wasDownvoted = Boolean(target.isDownvotedByMe);
    const previousVote: -1 | 0 | 1 = wasUpvoted ? 1 : wasDownvoted ? -1 : 0;

    const nextVote: -1 | 0 | 1 = wasUpvoted ? 0 : 1;
    const delta = wasUpvoted ? -1 : 1;

    setResources((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isUpvotedByMe: nextVote === 1,
              isDownvotedByMe: false,
              upvoteCount: Math.max(0, target.upvoteCount + delta),
            }
          : r,
      ),
    );

    try {
      const res = await voteResource(id, nextVote, previousVote);
      setResources((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                isUpvotedByMe: res.data.isUpvoted,
                isDownvotedByMe: res.data.isDownvoted ?? false,
                upvoteCount: res.data.upvoteCount,
                downvoteCount: res.data.downvoteCount,
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
                isUpvotedByMe: target.isUpvotedByMe,
                isDownvotedByMe: target.isDownvotedByMe,
                upvoteCount: target.upvoteCount,
              }
            : r,
        ),
      );
      toast.error(getApiErrorMessage(err, "Failed to record vote"));
    }
  };

  // Optimistic downvoting
  const handleDownvote = async (id: string, e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.stopPropagation();
    const target = resources.find((r) => r.id === id);
    if (!target) return;

    const wasUpvoted = Boolean(target.isUpvotedByMe) && (target.upvoteCount ?? 0) > 0;
    const wasDownvoted = Boolean(target.isDownvotedByMe);
    const previousVote: -1 | 0 | 1 = wasUpvoted ? 1 : wasDownvoted ? -1 : 0;

    const nextVote: -1 | 0 | 1 = wasDownvoted ? 0 : -1;
    const upvoteDelta = wasUpvoted ? -1 : 0;

    setResources((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isUpvotedByMe: false,
              isDownvotedByMe: nextVote === -1,
              upvoteCount: Math.max(0, target.upvoteCount + upvoteDelta),
            }
          : r,
      ),
    );

    try {
      const res = await voteResource(id, nextVote, previousVote);
      setResources((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                isUpvotedByMe: res.data.isUpvoted,
                isDownvotedByMe: res.data.isDownvoted ?? (nextVote === -1),
                upvoteCount: res.data.upvoteCount,
                downvoteCount: res.data.downvoteCount,
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
                isUpvotedByMe: target.isUpvotedByMe,
                isDownvotedByMe: target.isDownvotedByMe,
                upvoteCount: target.upvoteCount,
              }
            : r,
        ),
      );
      toast.error(getApiErrorMessage(err, "Failed to record downvote"));
    }
  };

  // Optimistic save / bookmark
  const handleBookmark = async (id: string, e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.stopPropagation();
    const target = resources.find((r) => r.id === id);
    if (!target) return;

    const nextSaved = !target.isSavedByMe;

    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isSavedByMe: nextSaved } : r)),
    );

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

  const handleCardClick = (cardItem: ResourceItem): void => {
    navigate(`/resources/${cardItem.id}`);
  };

  const handleVoteChangeFromModal = (
    resId: string,
    isUpvoted: boolean,
    newCount: number,
  ): void => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === resId
          ? {
              ...r,
              isUpvotedByMe: isUpvoted,
              upvoteCount: newCount,
            }
          : r,
      ),
    );
  };

  const handleSaveChangeFromModal = (resId: string, isSaved: boolean): void => {
    setResources((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, isSavedByMe: isSaved } : r)),
    );
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

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* In-page Left Sidebar with Live Counts */}
      <ResourceSidebar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onAddResource={() => setIsModalOpen(true)}
        counts={categoryCounts}
      />

      {/* Main Content Container */}
      <section className="flex-1 h-full overflow-y-auto p-3.5 sm:p-6 lg:p-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 pb-4">
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text tracking-tight">
              Developer Resource Library
            </h1>
            <p className="text-xs sm:text-sm text-text/60">
              Curated tools, guides, and learning materials shared by the community
            </p>
          </div>
          <Button
            size="md"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto shrink-0 shadow-sm"
          >
            Add Resource
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Input
            placeholder="Search resources, topics, keywords..."
            className="border-border focus:ring-primary pr-9 text-xs sm:text-sm"
            leftIcon={<MdOutlineSearch className="text-text/40 text-lg" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text/40 hover:text-text rounded-full transition-colors"
              aria-label="Clear search query"
            >
              <MdClear className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Pills & Sort dropdown */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4">
          <div className="w-full sm:w-auto min-w-0 flex-1">
            <CategoryPills
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              counts={categoryCounts}
            />
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Select
              fullWidth={false}
              selectSize="md"
              value={sortBy}
              onChange={(e) => handleSelectSort(e.target.value)}
              options={SORT_OPTIONS}
              className="border-border rounded-lg text-xs sm:text-sm font-semibold bg-white text-text/80 shadow-2xs w-full sm:min-w-48"
            />
          </div>
        </div>

        {/* Results metadata bar */}
        {!isLoading && !error && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text/60 pt-3 sm:pt-4 pb-1">
            <span className="truncate">
              Showing <strong className="text-text">{resources.length}</strong> of{" "}
              <strong className="text-text">{totalCount}</strong> resources
              {debouncedSearch ? ` for "${debouncedSearch}"` : ""}
            </span>
            {(selectedCategory !== "all" || debouncedSearch) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-primary hover:underline font-semibold shrink-0"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* Main Feed Content */}
        <div className="mt-4">
          {isLoading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="bg-white border border-border rounded-xl p-5 shadow-2xs space-y-4"
                >
                  <div className="flex items-start gap-3.5">
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 w-20 rounded" />
                      <Skeleton className="h-5 w-4/5 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full rounded" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                    <Skeleton className="h-7 w-16 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error state */
            <div className="py-12 text-center bg-white border border-border rounded-2xl p-8 space-y-3">
              <p className="text-rose-600 font-semibold text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRefreshKey((k) => k + 1)}
                className="gap-2 text-xs"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </Button>
            </div>
          ) : resources.length > 0 ? (
            /* Resource Cards Grid */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {resources.map((item) => (
                  <ResourceCard
                    key={item.id}
                    resource={mapToResourceCardItem(item)}
                    onUpvote={handleUpvote}
                    onDownvote={handleDownvote}
                    onBookmark={handleBookmark}
                    onClick={handleCardClick}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="gap-1 text-xs"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>

                  <span className="text-xs font-semibold text-text/70 px-3">
                    Page {page} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    className="gap-1 text-xs"
                  >
                    <span>Next</span>
                    <FiChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="mt-8 sm:mt-12">
              <EmptyState
                size="lg"
                bordered
                icon={<FiFolder className="w-8 h-8 text-primary" />}
                title={debouncedSearch ? "No matching resources" : "No resources found"}
                description={
                  debouncedSearch
                    ? `No resources match "${debouncedSearch}". Try searching for something else or clear the search.`
                    : selectedCategory !== "all"
                      ? `There are currently no resources in the "${selectedCategory}" category. Be the first to share one!`
                      : "No community resources have been shared yet. Help developers learn and grow by contributing a resource to the library."
                }
                action={
                  <div className="flex items-center gap-2">
                    {(debouncedSearch || selectedCategory !== "all") && (
                      <Button variant="outline" size="md" onClick={handleClearFilters}>
                        Clear Filters
                      </Button>
                    )}
                    <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
                      Add Resource
                    </Button>
                  </div>
                }
                className="py-16 sm:py-20 bg-white"
              />
            </div>
          )}
        </div>
      </section>

      {/* Add Resource Modal */}
      {isModalOpen && (
        <AddResourceModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialCategory={selectedCategory !== "all" ? selectedCategory : undefined}
          onSubmitSuccess={handleCreateSuccess}
        />
      )}

      {/* Resource Detail Modal */}
      {selectedDetailId !== null && (
        <ResourceDetailModal
          resourceId={selectedDetailId}
          open={selectedDetailId !== null}
          onClose={() => setSelectedDetailId(null)}
          onVoteChange={handleVoteChangeFromModal}
          onSaveChange={handleSaveChangeFromModal}
        />
      )}
    </div>
  );
}
