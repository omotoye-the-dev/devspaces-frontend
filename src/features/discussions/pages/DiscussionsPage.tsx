import type { JSX } from "react";
import {
  DiscussionDetailModal,
  CreateDiscussionModal,
  DiscussionFilterBar,
} from "@/features/discussions/components";

import { useDiscussionsPage } from "@/features/discussions/hooks/useDiscussionsPage";
import { DiscussionsHeader } from "@/features/discussions/components/discussions-page/DiscussionsHeader";
import { DiscussionsList } from "@/features/discussions/components/discussions-page/DiscussionsList";
import { DiscussionsSidebar } from "@/features/discussions/components/discussions-page/DiscussionsSidebar";

export default function DiscussionsPage(): JSX.Element {
  const page = useDiscussionsPage();
  const {
    activeSort,
    setActiveSort,
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
    isCreateModalOpen,
    setIsCreateModalOpen,
    currentUserId,
    selectedDiscussion,
    availableTags,
    handleVote,
    handleToggleBookmark,
    handleAddComment,
    handleDeleteComment,
    handleVoteComment,
    handleCreateDiscussion,
    handleCloseDiscussion,
    handleDeleteDiscussion,
  } = page;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-inter">
      {/* Page Header */}
      <DiscussionsHeader page={page} />

      {/* Filter and Search Bar */}
      <DiscussionFilterBar
        activeSort={activeSort}
        onSortChange={setActiveSort}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        availableTags={availableTags}
      />

      {/* Main Grid: Discussions List & Sidebar */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left / Center: Discussions Sequence */}
        <DiscussionsList page={page} />

        {/* Right Sidebar: Helpful Guidelines & Info */}
        <DiscussionsSidebar page={page} />
      </div>

      {/* Discussion Detail Modal */}
      <DiscussionDetailModal
        discussion={selectedDiscussion}
        open={Boolean(selectedDiscussion)}
        onClose={handleCloseDiscussion}
        onVote={handleVote}
        onAddComment={handleAddComment}
        onVoteComment={handleVoteComment}
        onToggleBookmark={handleToggleBookmark}
        onTagClick={(tag) => setSelectedTag(tag)}
        onDelete={handleDeleteDiscussion}
        onDeleteComment={handleDeleteComment}
        currentUserId={currentUserId}
        isOwner={Boolean(selectedDiscussion) && selectedDiscussion?.author.id === currentUserId}
      />

      {/* Create Discussion Modal */}
      <CreateDiscussionModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDiscussion}
      />
    </div>
  );
}
