import { useState, useMemo, useEffect, useCallback, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiPlus,
  HiOutlineChatBubbleLeftRight,
  HiOutlineQuestionMarkCircle,
  HiOutlineSparkles,
  HiOutlineLightBulb,
} from "react-icons/hi2";
import { Button, EmptyState, Skeleton } from "@/components/common";
import { toast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  createDiscussion,
  createDiscussionReply,
  deleteDiscussion,
  getDiscussionById,
  getDiscussions,
  likeDiscussion,
  saveDiscussion,
  voteDiscussionReply,
} from "@/features/discussions/api/discussionApi";
import type {
  Discussion,
  DiscussionSortOption,
  CreateDiscussionDto,
} from "@/types/discussions.types";
import {
  DiscussionCard,
  DiscussionDetailModal,
  CreateDiscussionModal,
  DiscussionFilterBar,
} from "@/features/discussions/components";
import { useLiveHub } from "@/hooks/useLiveHub";
import {
  normalizeDiscussionUpdate,
  type DiscussionCounts,
} from "@/features/discussions/utils/liveUpdate";

/**
 * Render-null component that subscribes to the SignalR live hub for a single
 * discussion and forwards normalised count updates to the parent page.
 *
 * One instance is mounted next to each DiscussionCard so the page owns a
 * single list-state and cards stay purely prop-driven.
 * Hub: /ws/hub/discussions/{id}/live
 */
function DiscussionLiveSync({
  id,
  onCounts,
}: {
  id: string;
  onCounts: (id: string, counts: DiscussionCounts) => void;
}): null {
  useLiveHub({
    type: "discussion",
    id,
    onUpdate: (data) => {
      const counts = normalizeDiscussionUpdate(data);
      if (counts) onCounts(id, counts);
    },
  });
  return null;
}

export default function DiscussionsPage(): JSX.Element {
  const navigate = useNavigate();
  const { id: discussionIdFromRoute } = useParams();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeSort, setActiveSort] = useState<DiscussionSortOption>("trending");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [localSelectedDiscussionId, setLocalSelectedDiscussionId] = useState<string | null>(null);
  const selectedDiscussionId = discussionIdFromRoute ?? localSelectedDiscussionId;

  const refreshDiscussions = async (): Promise<void> => {
    try {
      const data = await getDiscussions();
      setDiscussions(data);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Unable to load discussions. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadDiscussions(): Promise<void> {
      try {
        const data = await getDiscussions();
        if (active) setDiscussions(data);
      } catch (err: unknown) {
        if (active) {
          toast.error(getApiErrorMessage(err, "Unable to load discussions. Please try again."));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadDiscussions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!discussionIdFromRoute) {
      return;
    }

    const openDiscussionFromRoute = async (): Promise<void> => {
      try {
        const fullDiscussion = await getDiscussionById(discussionIdFromRoute);
        setDiscussions((current) => {
          const exists = current.some((item) => item.id === fullDiscussion.id);
          if (exists) {
            return current.map((item) =>
              item.id === fullDiscussion.id ? fullDiscussion : item,
            );
          }

          return [fullDiscussion, ...current];
        });
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err, "Unable to load the discussion details."));
      }
    };

    void openDiscussionFromRoute();
  }, [discussionIdFromRoute]);

  // Find currently active discussion for detail modal
  const selectedDiscussion = useMemo(() => {
    if (!selectedDiscussionId) return null;
    return discussions.find((d) => d.id === selectedDiscussionId) ?? null;
  }, [discussions, selectedDiscussionId]);

  // Extract all available tags dynamically from discussions
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    discussions.forEach((d) => {
      d.tags.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [discussions]);

  // Patch live count updates from SignalR into the discussion list state
  const handleLiveCounts = useCallback(
    (id: string, counts: DiscussionCounts): void => {
      setDiscussions((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...counts } : d)),
      );
    },
    [],
  );

  // Refresh comments for the open discussion when the comment hub fires
  const handleLiveCommentUpdate = useCallback(async (): Promise<void> => {
    if (!selectedDiscussionId) return;
    try {
      const updatedDiscussion = await getDiscussionById(selectedDiscussionId);
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === selectedDiscussionId ? updatedDiscussion : d,
        ),
      );
    } catch {
      // Silently ignore real-time refresh failures
    }
  }, [selectedDiscussionId]);

  // Real-time comment updates for the currently open discussion
  // Hub: /ws/hub/discussions/comments/{id}/live
  useLiveHub({
    type: "discussion-comment",
    id: selectedDiscussionId,
    enabled: Boolean(selectedDiscussionId),
    onUpdate: () => {
      void handleLiveCommentUpdate();
    },
  });

  // Handle discussion vote (up / down)
  const handleVote = async (
    discussionId: string,
    direction: "up" | "down",
  ): Promise<void> => {
    if (direction === "down") {
      toast.info("Discussions support likes; replies support upvotes and downvotes.");
      return;
    }

    const previous = discussions;
    setDiscussions((current) =>
      current.map((d) =>
        d.id === discussionId
          ? {
              ...d,
              isLiked: !d.isLiked,
              likeCount: (d.likeCount ?? 0) + (d.isLiked ? -1 : 1),
            }
          : d,
      ),
    );

    try {
      await likeDiscussion(discussionId);
    } catch (err: unknown) {
      setDiscussions(previous);
      toast.error(getApiErrorMessage(err, "Unable to like this discussion."));
    }
  };

  // Handle bookmark toggle
  const handleToggleBookmark = async (discussionId: string): Promise<void> => {
    const previous = discussions;
    setDiscussions((current) =>
      current.map((d) =>
        d.id === discussionId ? { ...d, isBookmarked: !d.isBookmarked } : d,
      ),
    );

    try {
      await saveDiscussion(discussionId);
    } catch (err: unknown) {
      setDiscussions(previous);
      toast.error(getApiErrorMessage(err, "Unable to update the saved discussion."));
    }
  };

  // Handle adding comment
  const handleAddComment = async (
    discussionId: string,
    content: string,
  ): Promise<void> => {
    try {
      const newComment = await createDiscussionReply(discussionId, { content });
      setDiscussions((current) =>
        current.map((discussion) =>
          discussion.id === discussionId
            ? {
                ...discussion,
                comments: [...discussion.comments, newComment],
                commentsCount: discussion.commentsCount + 1,
              }
            : discussion,
        ),
      );
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Unable to post your reply."));
    }
  };

  // Handle voting on a comment
  const handleVoteComment = async (
    discussionId: string,
    commentId: string,
    direction: "up" | "down",
  ): Promise<void> => {
    try {
      await voteDiscussionReply(discussionId, commentId, direction === "up" ? 0 : 1);
      const updatedDiscussion = await getDiscussionById(discussionId);
      setDiscussions((current) =>
        current.map((discussion) =>
          discussion.id === discussionId ? updatedDiscussion : discussion,
        ),
      );
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Unable to vote on this reply."));
    }
  };

  // Handle creating a new discussion
  const handleCreateDiscussion = async (data: CreateDiscussionDto): Promise<void> => {
    try {
      const newDiscussion = await createDiscussion(data);
      await refreshDiscussions();
      toast.success("Your discussion was posted successfully!");
      setLocalSelectedDiscussionId(newDiscussion.id);
      navigate(`/discussions/${newDiscussion.id}`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Unable to post your discussion."));
    }
  };

  const handleCloseDiscussion = (): void => {
    setLocalSelectedDiscussionId(null);
    if (discussionIdFromRoute) {
      navigate("/discussions");
    }
  };

  // Handle deleting a discussion (only the author can do this)
  const handleDeleteDiscussion = async (discussionId: string): Promise<void> => {
    const previous = discussions;
    setDiscussions((current) => current.filter((d) => d.id !== discussionId));
    if (selectedDiscussionId === discussionId) {
      setLocalSelectedDiscussionId(null);
      if (discussionIdFromRoute) {
        navigate("/discussions");
      }
    }

    try {
      await deleteDiscussion(discussionId);
      toast.success("Discussion deleted");
    } catch (err: unknown) {
      setDiscussions(previous);
      toast.error(getApiErrorMessage(err, "Unable to delete this discussion."));
    }
  };

  const handleOpenDetails = async (discussion: Discussion): Promise<void> => {
    navigate(`/discussions/${discussion.id}`);
    setLocalSelectedDiscussionId(discussion.id);

    try {
      const fullDiscussion = await getDiscussionById(discussion.id);
      setDiscussions((current) =>
        current.map((item) => (item.id === discussion.id ? fullDiscussion : item)),
      );
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Unable to load the discussion details."));
    }
  };

  // Filter & sort discussions
  const filteredDiscussions = useMemo(() => {
    return discussions
      .filter((disc) => {
        // Tag filter
        if (selectedTag) {
          const matchTag = disc.tags.some(
            (t) => t.toLowerCase() === selectedTag.toLowerCase(),
          );
          if (!matchTag) return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = disc.title.toLowerCase().includes(query);
          const matchContent = disc.content.toLowerCase().includes(query);
          const matchAuthor =
            disc.author.name.toLowerCase().includes(query) ||
            disc.author.username.toLowerCase().includes(query);
          const matchTags = disc.tags.some((t) => t.toLowerCase().includes(query));

          if (!matchTitle && !matchContent && !matchAuthor && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (activeSort === "trending") {
          const scoreA = (a.likeCount ?? a.upvotes) * 2 + a.commentsCount;
          const scoreB = (b.likeCount ?? b.upvotes) * 2 + b.commentsCount;
          return scoreB - scoreA;
        }

        if (activeSort === "most_answered") {
          return b.commentsCount - a.commentsCount;
        }

        if (activeSort === "unanswered") {
          return a.commentsCount - b.commentsCount;
        }

        // Default: latest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [discussions, selectedTag, searchQuery, activeSort]);

  const handleClearFilters = (): void => {
    setSelectedTag(null);
    setSearchQuery("");
    setActiveSort("trending");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-inter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-border p-5 sm:p-6 rounded-lg shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
              Community Discussions
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              <HiOutlineSparkles className="w-3 h-3" />
              Q&A
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text/60 leading-relaxed max-w-2xl">
            Ask technical questions, share problem-solving solutions, and collaborate with developers.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            variant="primary"
            leftIcon={<HiPlus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Ask a Question
          </Button>
        </div>
      </div>

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
        <section className="flex-1 w-full space-y-3 min-w-0" aria-label="Discussions List">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white border border-border rounded-lg p-4 flex gap-4"
                >
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
                  <DiscussionLiveSync
                    id={discussion.id}
                    onCounts={handleLiveCounts}
                  />
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

        {/* Right Sidebar: Helpful Guidelines & Info */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
          {/* Ask Question Guidelines Card */}
          <div className="bg-white border border-border rounded-lg p-4 sm:p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <HiOutlineLightBulb className="w-4 h-4 text-amber-500" />
              <span>How to ask a good question</span>
            </h3>
            <ul className="text-xs text-text/70 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Summarize the specific problem in the question title.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Describe what you expected to happen vs what actually occurred.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Tag relevant technologies (e.g. React, TypeScript, Node.js).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Provide minimal reproducible code snippets or errors.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                leftIcon={<HiPlus className="w-3.5 h-3.5" />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Post Discussion
              </Button>
            </div>
          </div>
        </aside>
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
