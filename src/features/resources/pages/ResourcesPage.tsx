import type { JSX } from "react";
import { ResourceSidebar } from "@/features/resources/components/ResourceSidebar";
import { AddResourceModal } from "@/features/resources/components/AddResourceModal";
import { ResourceDetailModal } from "@/features/resources/components/ResourceDetailModal";

import { useResourcesList } from "@/features/resources/hooks/useResourcesList";
import { ResourcesHeader } from "@/features/resources/components/resources-list/ResourcesHeader";
import { ResourcesSearch } from "@/features/resources/components/resources-list/ResourcesSearch";
import { ResourcesFilters } from "@/features/resources/components/resources-list/ResourcesFilters";
import { ResourcesFeed } from "@/features/resources/components/resources-list/ResourcesFeed";

export default function ResourcesPage(): JSX.Element {
  const list = useResourcesList();
  const {
    selectedCategory,
    debouncedSearch,
    totalCount,
    resources,
    categoryCounts,
    isLoading,
    error,
    isModalOpen,
    setIsModalOpen,
    selectedDetailId,
    setSelectedDetailId,
    handleSelectCategory,
    handleOpenAddResource,
    handleVoteChangeFromModal,
    handleSaveChangeFromModal,
    handleCreateSuccess,
    handleClearFilters,
  } = list;

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* In-page Left Sidebar with Live Counts */}
      <ResourceSidebar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onAddResource={handleOpenAddResource}
        counts={categoryCounts}
      />

      {/* Main Content Container */}
      <section className="flex-1 h-full overflow-y-auto p-3.5 sm:p-6 lg:p-8">
        {/* Header row */}
        <ResourcesHeader list={list} />

        {/* Search Input */}
        <ResourcesSearch list={list} />

        {/* Categories Pills & Sort dropdown */}
        <ResourcesFilters list={list} />

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
        <ResourcesFeed list={list} />
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
