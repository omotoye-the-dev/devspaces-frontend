import { useState, useMemo, type JSX } from "react";
import {
  HiPlus,
  HiOutlineChatBubbleLeftRight,
  HiOutlineQuestionMarkCircle,
  HiOutlineSparkles,
  HiOutlineLightBulb,
} from "react-icons/hi2";
import { Button, EmptyState } from "@/components/common";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/useToast";
import type {
  Discussion,
  DiscussionComment,
  DiscussionSortOption,
  CreateDiscussionDto,
} from "@/types/discussions.types";
import {
  DiscussionCard,
  DiscussionDetailModal,
  CreateDiscussionModal,
  DiscussionFilterBar,
} from "@/features/discussions/components";

export default function DiscussionsPage(): JSX.Element {
  const user = useAuthStore((state) => state.user);

  // Discussions state starts empty with zero dummy data as per requirement
  const [discussions, setDiscussions] = useState<Discussion[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("devspace_local_discussions");
        if (stored) {
          const parsed = JSON.parse(stored) as Discussion[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Fallback to empty
      }
    }
    return [];
  });

  const [activeSort, setActiveSort] = useState<DiscussionSortOption>("trending");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);

  // Synchronize discussions to storage so newly created discussions persist during session
  const saveDiscussions = (newDiscussions: Discussion[]): void => {
    setDiscussions(newDiscussions);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("devspace_local_discussions", JSON.stringify(newDiscussions));
      } catch {
        // Ignore storage errors
      }
    }
  };

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

  // Handle discussion vote (up / down)
  const handleVote = (discussionId: string, direction: "up" | "down"): void => {
    const updated = discussions.map((disc) => {
      if (disc.id !== discussionId) return disc;

      let upvotes = disc.upvotes;
      let downvotes = disc.downvotes;
      let newVote: "up" | "down" | null = direction;

      if (disc.userVote === direction) {
        // Remove vote
        newVote = null;
        if (direction === "up") upvotes -= 1;
        else downvotes -= 1;
      } else {
        // Switching or new vote
        if (disc.userVote === "up") upvotes -= 1;
        if (disc.userVote === "down") downvotes -= 1;

        if (direction === "up") upvotes += 1;
        else downvotes += 1;
      }

      return {
        ...disc,
        upvotes: Math.max(0, upvotes),
        downvotes: Math.max(0, downvotes),
        userVote: newVote,
      };
    });

    saveDiscussions(updated);
  };

  // Handle bookmark toggle
  const handleToggleBookmark = (discussionId: string): void => {
    const updated = discussions.map((disc) => {
      if (disc.id !== discussionId) return disc;
      const nextBookmarked = !disc.isBookmarked;
      if (nextBookmarked) {
        toast.success("Discussion saved to bookmarks");
      } else {
        toast.info("Discussion removed from bookmarks");
      }
      return {
        ...disc,
        isBookmarked: nextBookmarked,
      };
    });

    saveDiscussions(updated);
  };

  // Handle adding comment
  const handleAddComment = (discussionId: string, content: string): void => {
    const authorName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      user?.userName ||
      user?.username ||
      "DevSpace Developer";

    const authorUsername = user?.userName || user?.username || "developer";

    const newComment: DiscussionComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      discussionId,
      content,
      createdAt: "Just now",
      upvotes: 0,
      isUpvoted: false,
      author: {
        id: user?.id || `user-${Date.now()}`,
        name: authorName,
        username: authorUsername,
        avatarUrl: user?.avatarUrl ?? undefined,
        role: "Community Member",
      },
    };

    const updated = discussions.map((disc) => {
      if (disc.id !== discussionId) return disc;
      return {
        ...disc,
        commentsCount: disc.commentsCount + 1,
        comments: [newComment, ...disc.comments],
      };
    });

    saveDiscussions(updated);
  };

  // Handle voting on a comment
  const handleVoteComment = (discussionId: string, commentId: string): void => {
    const updated = discussions.map((disc) => {
      if (disc.id !== discussionId) return disc;

      const updatedComments = disc.comments.map((c) => {
        if (c.id !== commentId) return c;
        const nextUpvoted = !c.isUpvoted;
        return {
          ...c,
          isUpvoted: nextUpvoted,
          upvotes: nextUpvoted ? c.upvotes + 1 : Math.max(0, c.upvotes - 1),
        };
      });

      return {
        ...disc,
        comments: updatedComments,
      };
    });

    saveDiscussions(updated);
  };

  // Handle creating a new discussion
  const handleCreateDiscussion = (data: CreateDiscussionDto): void => {
    const authorName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      user?.userName ||
      user?.username ||
      "DevSpace Developer";

    const authorUsername = user?.userName || user?.username || "developer";

    const newDiscussion: Discussion = {
      id: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title,
      content: data.content,
      tags: data.tags,
      createdAt: "Just now",
      upvotes: 1, // Author automatic upvote
      downvotes: 0,
      userVote: "up",
      commentsCount: 0,
      comments: [],
      author: {
        id: user?.id || `user-${Date.now()}`,
        name: authorName,
        username: authorUsername,
        avatarUrl: user?.avatarUrl ?? undefined,
        role: "Developer",
      },
      isBookmarked: false,
    };

    const updated = [newDiscussion, ...discussions];
    saveDiscussions(updated);
    toast.success("Your discussion was posted successfully!");
    // Automatically select the new discussion so user sees the detail modal immediately
    setSelectedDiscussionId(newDiscussion.id);
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
          const scoreA = (a.upvotes - a.downvotes) * 2 + a.commentsCount;
          const scoreB = (b.upvotes - b.downvotes) * 2 + b.commentsCount;
          return scoreB - scoreA;
        }

        if (activeSort === "most_answered") {
          return b.commentsCount - a.commentsCount;
        }

        if (activeSort === "unanswered") {
          return a.commentsCount - b.commentsCount;
        }

        // Default: latest
        return 0;
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
          {discussions.length === 0 ? (
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
                <DiscussionCard
                  key={discussion.id}
                  discussion={discussion}
                  onOpenDetails={(disc) => setSelectedDiscussionId(disc.id)}
                  onVote={handleVote}
                  onTagClick={(tag) => setSelectedTag(tag)}
                  onToggleBookmark={handleToggleBookmark}
                />
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
        onClose={() => setSelectedDiscussionId(null)}
        onVote={handleVote}
        onAddComment={handleAddComment}
        onVoteComment={handleVoteComment}
        onToggleBookmark={handleToggleBookmark}
        onTagClick={(tag) => setSelectedTag(tag)}
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
