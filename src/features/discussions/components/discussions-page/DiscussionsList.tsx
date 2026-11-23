import type { JSX } from "react";
import { HiPlus, HiOutlineChatBubbleLeftRight, HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { Button, EmptyState, Skeleton } from "@/shared/ui";
import { DiscussionCard } from "@/features/discussions/components";
import { DiscussionLiveSync } from "@/features/discussions/components/DiscussionLiveSync";
import type { UseDiscussionsPageResult } from "@/features/discussions/hooks/useDiscussionsPage";

/** Loading skeletons, empty state or the discussion cards. */
export function DiscussionsList({ page }: { page: UseDiscussionsPageResult }): JSX.Element {
  const {
    discussions,
    isLoading,
    setSelectedTag,
    setIsCreateModalOpen,
    currentUserId,
    handleLiveCounts,
    handleVote,
    handleToggleBookmark,
    handleDeleteDiscussion,
    handleOpenDetails,
    filteredDiscussions,
    handleClearFilters,
  } = page;

  return (
    <>
      <section className="flex-1 w-full space-y-3 min-w-0" aria-label="Discussions List">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white border border-border rounded-lg p-4 flex gap-4">
                <div className="w-10 flex flex-col items-center gap-2 shrink-0">
                  <Skeleton variant="circular" width={28} height={28} />
                  <Skeleton variant="text" width={20} height={12} />
                </div>
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width={120} height={12} />
                  </div>
                  <Skeleton variant="text" width="80%" height={18} />
                  <Skeleton variant="text" width="100%" height={14} />
                  <Skeleton variant="text" width="60%" height={14} />
                  <div className="flex items-center gap-2 pt-1">
                    <Skeleton variant="rounded" width={56} height={20} />
                    <Skeleton variant="rounded" width={56} height={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : discussions.length === 0 ? (
          /* Empty state when no discussions exist at all */
          <div className="bg-white border border-border rounded-lg p-6 sm:p-10 shadow-2xs">
            <EmptyState
              size="md"
              bordered
              icon={<HiOutlineChatBubbleLeftRight className="w-6 h-6 text-primary" />}
              title="No discussions yet"
              description="There are no questions or discussions here yet. Be the first to start a conversation with the community!"
              action={
                <Button
                  variant="primary"
                  leftIcon={<HiPlus />}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Ask the First Question
                </Button>
              }
            />
          </div>
        ) : filteredDiscussions.length === 0 ? (
          /* Empty state when filters return 0 results */
          <div className="bg-white border border-border rounded-lg p-6 sm:p-10 shadow-2xs">
            <EmptyState
              size="md"
              bordered
              icon={<HiOutlineQuestionMarkCircle className="w-6 h-6 text-text/40" />}
              title="No discussions match your filter"
              description="We couldn't find any questions matching your selected topic or search keywords."
              action={
                <Button variant="secondary" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              }
              secondaryAction={
                <Button
                  variant="primary"
                  leftIcon={<HiPlus />}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Ask a Question
                </Button>
              }
            />
          </div>
        ) : (
          /* Reddit-like discussion post sequence */
          <div className="space-y-3">
            {filteredDiscussions.map((discussion) => (
              <div key={discussion.id}>
                {/* Render-null SignalR sync — one connection per visible card */}
                <DiscussionLiveSync id={discussion.id} onCounts={handleLiveCounts} />
                <DiscussionCard
                  discussion={discussion}
                  onOpenDetails={handleOpenDetails}
                  onVote={handleVote}
                  onTagClick={(tag) => setSelectedTag(tag)}
                  onToggleBookmark={handleToggleBookmark}
                  onDelete={handleDeleteDiscussion}
                  isOwner={Boolean(currentUserId) && discussion.author.id === currentUserId}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
