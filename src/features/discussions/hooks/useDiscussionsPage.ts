import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/shared/hooks/useToast";
import { getApiErrorMessage } from "@/shared/lib/utils/apiError";
import { useAuthStore } from "@/store";
import {
  createDiscussion,
  createDiscussionReply,
  deleteDiscussion,
  deleteDiscussionReply,
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
} from "@/features/discussions/types/discussions.types";
import { useLiveHub } from "@/shared/hooks/useLiveHub";
import type { DiscussionCounts } from "@/features/discussions/utils/liveUpdate";

/** Discussions list: sort/tag/search filters, live counts, votes, saves and the detail/create modals. */
export function useDiscussionsPage() {
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
            return current.map((item) => (item.id === fullDiscussion.id ? fullDiscussion : item));
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
  const handleLiveCounts = useCallback((id: string, counts: DiscussionCounts): void => {
    setDiscussions((prev) => prev.map((d) => (d.id === id ? { ...d, ...counts } : d)));
  }, []);

  // Refresh comments for the open discussion when the comment hub fires
  const handleLiveCommentUpdate = useCallback(async (): Promise<void> => {
    if (!selectedDiscussionId) return;
    try {
      const updatedDiscussion = await getDiscussionById(selectedDiscussionId);
      setDiscussions((prev) =>
        prev.map((d) => (d.id === selectedDiscussionId ? updatedDiscussion : d)),
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
  const handleVote = async (discussionId: string, direction: "up" | "down"): Promise<void> => {
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
      current.map((d) => (d.id === discussionId ? { ...d, isBookmarked: !d.isBookmarked } : d)),
    );

    try {
      await saveDiscussion(discussionId);
    } catch (err: unknown) {
      setDiscussions(previous);
      toast.error(getApiErrorMessage(err, "Unable to update the saved discussion."));
    }
  };

  // Handle adding comment
  const handleAddComment = async (discussionId: string, content: string): Promise<void> => {
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

  // Handle deleting a reply
  const handleDeleteComment = async (discussionId: string, commentId: string): Promise<void> => {
    const previous = discussions;
    setDiscussions((current) =>
      current.map((discussion) =>
        discussion.id === discussionId
          ? {
              ...discussion,
              comments: discussion.comments.filter((c) => c.id !== commentId),
              commentsCount: Math.max(0, discussion.commentsCount - 1),
            }
          : discussion,
      ),
    );

    try {
      await deleteDiscussionReply(discussionId, commentId);
      toast.success("Reply deleted");
    } catch (err: unknown) {
      setDiscussions(previous);
      toast.error(getApiErrorMessage(err, "Unable to delete this reply."));
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
          const matchTag = disc.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
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

        // Default: latest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [discussions, selectedTag, searchQuery, activeSort]);

  const handleClearFilters = (): void => {
    setSelectedTag(null);
    setSearchQuery("");
    setActiveSort("trending");
  };

  return {
    discussions,
    setDiscussions,
    isLoading,
    setIsLoading,
    activeSort,
    setActiveSort,
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
    isCreateModalOpen,
    setIsCreateModalOpen,
    localSelectedDiscussionId,
    setLocalSelectedDiscussionId,
    discussionIdFromRoute,
    navigate,
    currentUserId,
    selectedDiscussionId,
    refreshDiscussions,
    selectedDiscussion,
    availableTags,
    handleLiveCounts,
    handleLiveCommentUpdate,
    handleVote,
    handleToggleBookmark,
    handleAddComment,
    handleDeleteComment,
    handleVoteComment,
    handleCreateDiscussion,
    handleCloseDiscussion,
    handleDeleteDiscussion,
    handleOpenDetails,
    filteredDiscussions,
    handleClearFilters,
  };
}

export type UseDiscussionsPageResult = ReturnType<typeof useDiscussionsPage>;
