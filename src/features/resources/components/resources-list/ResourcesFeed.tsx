import type { JSX } from "react";
import { Fragment } from "react";
import { Button, EmptyState, Skeleton } from "@/shared/ui";
import { FiFolder, FiChevronLeft, FiChevronRight, FiRefreshCw } from "react-icons/fi";
import { ResourceCard } from "@/features/resources/components/ResourceCard";
import { mapToResourceCardItem } from "@/features/resources/utils/mapResourceCard";
import { ResourceLiveSync } from "@/features/resources/components/ResourceLiveSync";

import type { UseResourcesListResult } from "@/features/resources/hooks/useResourcesList";

/** Skeletons, empty state or the resource grid with load-more. */
export function ResourcesFeed({ list }: { list: UseResourcesListResult }): JSX.Element {
  const {
    selectedCategory,
    debouncedSearch,
    page,
    setPage,
    totalPages,
    resources,
    isLoading,
    error,
    setRefreshKey,
    handleLiveCounts,
    sortedResources,
    handleUpvote,
    handleDownvote,
    handleBookmark,
    handleOpenAddResource,
    handleCardClick,
    handleClearFilters,
  } = list;

  return (
    <>
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
              {sortedResources.map((item) => (
                <Fragment key={item.id}>
                  <ResourceLiveSync id={item.id} onCounts={handleLiveCounts} />
                  <ResourceCard
                    resource={mapToResourceCardItem(item)}
                    onUpvote={handleUpvote}
                    onDownvote={handleDownvote}
                    onBookmark={handleBookmark}
                    onClick={handleCardClick}
                  />
                </Fragment>
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
                  <Button variant="primary" size="md" onClick={handleOpenAddResource}>
                    Add Resource
                  </Button>
                </div>
              }
              className="py-16 sm:py-20 bg-white"
            />
          </div>
        )}
      </div>
    </>
  );
}
