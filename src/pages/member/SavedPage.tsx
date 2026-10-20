import { useEffect, useMemo, useState, useCallback, type JSX } from "react";
import { FiBookmark, FiMessageSquare } from "react-icons/fi";
import { MdOutlineSearch, MdClear } from "react-icons/md";
import { Input, Tabs, EmptyState, Skeleton } from "@/components/common";
import { ArticleCard } from "@/features/articles/components/ArticleCard";
import { ResourceCard, type ResourceItem } from "@/features/resources/components/ResourceCard";
import { getSavedArticles, saveArticle, type Article } from "@/features/articles/api/articleApi";
import { getSavedResources, saveResource } from "@/features/resources/api/resources.api";
import {
  getSavedDiscussions,
  getDiscussionById,
  likeDiscussion,
  saveDiscussion,
  deleteDiscussion,
  deleteDiscussionReply,
  createDiscussionReply,
  voteDiscussionReply,
} from "@/features/discussions/api/discussionApi";
import {
  DiscussionCard,
  DiscussionDetailModal,
} from "@/features/discussions/components";
import type { Discussion } from "@/types/discussions.types";
import type { ResourceListItem } from "@/types/resources.types";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { toast } from "@/hooks/useToast";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLiveHub } from "@/hooks/useLiveHub";
import {
  normalizeDiscussionUpdate,
  type DiscussionCounts,
} from "@/features/discussions/utils/liveUpdate";
import {
  normalizeResourceUpdate,
  type ResourceCounts,
} from "@/features/resources/utils/liveUpdate";

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

function ResourceLiveSync({
  id,
  onCounts,
}: {
  id: string;
  onCounts: (id: string, counts: ResourceCounts) => void;
}): null {
  useLiveHub({
    type: "resource",
    id,
    onUpdate: (data) => {
      const counts = normalizeResourceUpdate(data);
      if (counts) onCounts(id, counts);
    },
  });
  return null;
}

type SavedTab = "all" | "articles" | "resources" | "discussions";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function mapToResourceCardItem(item: ResourceListItem): ResourceItem {
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
    upvotesCount: item.upvoteCount ?? 0,
    downvotesCount: item.downvoteCount ?? 0,
    isUpvoted: Boolean(item.isUpvotedByMe),
    isDownvoted: Boolean(item.isDownvotedByMe),
    isBookmarked: item.isSavedByMe,
  };
}

export default function SavedPage(): JSX.Element {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [activeTab, setActiveTab] = useState<SavedTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [articles, setArticles] = useState<Article[]>([]);
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedItems(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        const [articlesRes, resourcesRes, discussionsRes] = await Promise.allSettled([
          getSavedArticles(),
          getSavedResources(),
          getSavedDiscussions(),
        ]);

        if (!isMounted) return;

        if (articlesRes.status === "fulfilled") {
          setArticles(articlesRes.value.data);
        }
        if (resourcesRes.status === "fulfilled") {
          setResources(resourcesRes.value.data || []);
        }
        if (discussionsRes.status === "fulfilled") {
          setDiscussions(discussionsRes.value);
        }

        if (
          articlesRes.status === "rejected" &&
          resourcesRes.status === "rejected" &&
          discussionsRes.status === "rejected"
        ) {
          setError(getApiErrorMessage(resourcesRes.reason, "Failed to load saved items."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadSavedItems();

    return () => {
      isMounted = false;
    };
  }, []);

  // Patch live count updates from SignalR into discussion state
  const handleLiveDiscussionCounts = useCallback(
    (id: string, counts: DiscussionCounts): void => {
      setDiscussions((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...counts } : d)),
      );
    },
    [],
  );

  // Patch live count updates from SignalR into resource state
  const handleLiveResourceCounts = useCallback(
    (id: string, counts: ResourceCounts): void => {
      setResources((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                upvoteCount: counts.upvoteCount ?? r.upvoteCount,
                downvoteCount: counts.downvoteCount ?? r.downvoteCount,
                saveCount: counts.saveCount ?? r.saveCount,
              }
            : r,
        ),
      );
    },
    [],
  );

  // Refresh comments for the open discussion in SavedPage when comment hub fires
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

  // Real-time comment updates for currently open discussion
  useLiveHub({
    type: "discussion-comment",
    id: selectedDiscussionId,
    enabled: Boolean(selectedDiscussionId),
    onUpdate: () => {
      void handleLiveCommentUpdate();
    },
  });

  const handleUnsaveArticle = async (id: string): Promise<void> => {
    const prev = articles;
    setArticles((p) => p.filter((a) => a.id !== id));
    try {
      await saveArticle(id);
      toast.success("Removed from saved articles");
    } catch (err: unknown) {
      setArticles(prev);
      toast.error(getApiErrorMessage(err, "Failed to remove saved article"));
    }
  };

  const handleUnsaveResource = async (id: string): Promise<void> => {
    const prev = resources;
    setResources((p) => p.filter((r) => r.id !== id));
    try {
      await saveResource(id, false);
      toast.success("Removed from saved resources");
    } catch (err: unknown) {
      setResources(prev);
      toast.error(getApiErrorMessage(err, "Failed to remove saved resource"));
    }
  };

  const selectedDiscussion = useMemo(
    () => discussions.find((d) => d.id === selectedDiscussionId) ?? null,
    [discussions, selectedDiscussionId],
  );

  const handleUnsaveDiscussion = async (id: string): Promise<void> => {
    const prev = discussions;
    setDiscussions((p) => p.filter((d) => d.id !== id));
    try {
      await saveDiscussion(id);
      toast.success("Removed from saved discussions");
    } catch (err: unknown) {
      setDiscussions(prev);
      toast.error(getApiErrorMessage(err, "Failed to remove saved discussion"));
    }
  };

  const handleVoteDiscussion = async (
    discussionId: string,
    direction: "up" | "down",
  ): Promise<void> => {
    if (direction === "down") return;

    const prev = discussions;
    setDiscussions((current) =>
      current.map((d) =>
        d.id === discussionId
          ? { ...d, isLiked: !d.isLiked, likeCount: (d.likeCount ?? 0) + (d.isLiked ? -1 : 1) }
          : d,
      ),
    );

    try {
      await likeDiscussion(discussionId);
    } catch {
      setDiscussions(prev);
      toast.error("Unable to like this discussion.");
    }
  };

  const handleOpenDiscussionDetails = async (discussion: Discussion): Promise<void> => {
    setSelectedDiscussionId(discussion.id);
    try {
      const fullDiscussion = await getDiscussionById(discussion.id);
      setDiscussions((current) =>
        current.map((item) => (item.id === discussion.id ? fullDiscussion : item)),
      );
    } catch {
      toast.error("Unable to load the discussion details.");
    }
  };

  const handleAddDiscussionComment = async (
    discussionId: string,
    content: string,
  ): Promise<void> => {
    try {
      await createDiscussionReply(discussionId, { content });
      const updatedDiscussion = await getDiscussionById(discussionId);
      setDiscussions((current) =>
        current.map((d) => (d.id === discussionId ? updatedDiscussion : d)),
      );
    } catch {
      toast.error("Unable to post your reply.");
    }
  };

  const handleDeleteDiscussionComment = async (
    discussionId: string,
    commentId: string,
  ): Promise<void> => {
    const prev = discussions;
    setDiscussions((current) =>
      current.map((d) =>
        d.id === discussionId
          ? {
              ...d,
              comments: d.comments.filter((c) => c.id !== commentId),
              commentsCount: Math.max(0, d.commentsCount - 1),
            }
          : d,
      ),
    );

    try {
      await deleteDiscussionReply(discussionId, commentId);
      toast.success("Reply deleted");
    } catch {
      setDiscussions(prev);
      toast.error("Unable to delete this reply.");
    }
  };

  const handleDeleteDiscussion = async (discussionId: string): Promise<void> => {
    const prev = discussions;
    setDiscussions((p) => p.filter((d) => d.id !== discussionId));
    if (selectedDiscussionId === discussionId) {
      setSelectedDiscussionId(null);
    }

    try {
      await deleteDiscussion(discussionId);
      toast.success("Discussion deleted");
    } catch {
      setDiscussions(prev);
      toast.error("Unable to delete this discussion.");
    }
  };

  const handleVoteDiscussionComment = async (
    discussionId: string,
    commentId: string,
    direction: "up" | "down",
  ): Promise<void> => {
    try {
      await voteDiscussionReply(discussionId, commentId, direction === "up" ? 0 : 1);
      const updatedDiscussion = await getDiscussionById(discussionId);
      setDiscussions((current) =>
        current.map((d) => (d.id === discussionId ? updatedDiscussion : d)),
      );
    } catch {
      toast.error("Unable to vote on this reply.");
    }
  };

  const search = searchQuery.trim().toLowerCase();

  const filteredArticles = useMemo(
    () =>
      search
        ? articles.filter(
            (a) =>
              a.title.toLowerCase().includes(search) ||
              (a.excerpt || "").toLowerCase().includes(search),
          )
        : articles,
    [articles, search],
  );

  const filteredResources = useMemo(
    () =>
      search
        ? resources.filter(
            (r) =>
              r.title.toLowerCase().includes(search) ||
              r.description.toLowerCase().includes(search),
          )
        : resources,
    [resources, search],
  );

  const filteredDiscussions = useMemo(
    () =>
      search
        ? discussions.filter(
            (d) =>
              d.title.toLowerCase().includes(search) ||
              d.content.toLowerCase().includes(search),
          )
        : discussions,
    [discussions, search],
  );

  const totalCount = articles.length + resources.length + discussions.length;

  const tabItems = [
    { id: "all", label: "All", count: totalCount },
    { id: "articles", label: "Articles", count: articles.length },
    { id: "resources", label: "Resources", count: resources.length },
    { id: "discussions", label: "Discussions", count: discussions.length },
  ];

  const showArticles = activeTab === "all" || activeTab === "articles";
  const showResources = activeTab === "all" || activeTab === "resources";
  const showDiscussions = activeTab === "all" || activeTab === "discussions";

  const visibleCount =
    (showArticles ? filteredArticles.length : 0) +
    (showResources ? filteredResources.length : 0) +
    (showDiscussions ? filteredDiscussions.length : 0);

  return (
    <div className="min-h-full bg-background overflow-y-auto">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary">
            Library
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text tracking-tight">
            Saved
          </h1>
          <p className="text-xs sm:text-sm text-text/60">
            {totalCount} {totalCount === 1 ? "item" : "items"} across articles, resources and
            discussions
          </p>
        </header>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Tabs
            variant="pills"
            value={activeTab}
            onChange={(id) => setActiveTab(id as SavedTab)}
            items={tabItems}
          />

          <div className="relative sm:w-72 shrink-0">
            <Input
              placeholder="Search saved items"
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
        </div>

        {/* Content */}
        {isLoading ? (
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
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center bg-white border border-border rounded-2xl p-8 space-y-3">
            <p className="text-rose-600 font-semibold text-sm">{error}</p>
          </div>
        ) : visibleCount > 0 ? (
          <div className="space-y-5">
            {showDiscussions && filteredDiscussions.length > 0 && (
              <div className="space-y-3">
                {filteredDiscussions.map((discussion) => (
                  <div key={`discussion-${discussion.id}`}>
                    <DiscussionLiveSync
                      id={discussion.id}
                      onCounts={handleLiveDiscussionCounts}
                    />
                    <DiscussionCard
                      discussion={discussion}
                      onOpenDetails={(d) => void handleOpenDiscussionDetails(d)}
                      onVote={(id, direction) => void handleVoteDiscussion(id, direction)}
                      onToggleBookmark={(id) => void handleUnsaveDiscussion(id)}
                      onDelete={(id) => void handleDeleteDiscussion(id)}
                      isOwner={Boolean(currentUserId) && discussion.author.id === currentUserId}
                    />
                  </div>
                ))}
              </div>
            )}

            {(showArticles || showResources) && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {showArticles &&
                  filteredArticles.map((article) => (
                    <ArticleCard
                      key={`article-${article.id}`}
                      id={article.id}
                      authorId={article.authorId}
                      title={article.title}
                      excerpt={article.excerpt || ""}
                      tagNames={article.tagNames || article.tags || []}
                      coverImage={article.coverImageUrl || article.coverImage || undefined}
                      authorName={
                        article.author?.name || article.author?.username || article.authorName
                      }
                      authorAvatar={article.author?.avatarUrl || undefined}
                      createdAt={article.createdAt}
                      readTimeMinutes={article.readingTimeMinutes || article.readingTime}
                      likes={article.likeCount ?? article.likes ?? 0}
                      comments={article.commentCount ?? article.comments ?? 0}
                      isBookmarked
                      onBookmark={() => void handleUnsaveArticle(article.id)}
                      variant="vertical"
                    />
                  ))}

                {showResources &&
                  filteredResources.map((resource) => (
                    <div key={`resource-${resource.id}`}>
                      <ResourceLiveSync
                        id={resource.id}
                        onCounts={handleLiveResourceCounts}
                      />
                      <ResourceCard
                        resource={mapToResourceCardItem(resource)}
                        onBookmark={() => void handleUnsaveResource(resource.id)}
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            size="lg"
            bordered
            icon={
              activeTab === "discussions" ? (
                <FiMessageSquare className="w-8 h-8 text-primary" />
              ) : (
                <FiBookmark className="w-8 h-8 text-primary" />
              )
            }
            title={search ? "No matching saved items" : "Nothing saved yet"}
            description={
              search
                ? `No saved items match "${search}". Try a different search.`
                : "Bookmark articles, resources and discussions to find them here later."
            }
            className="py-16 sm:py-20 bg-white"
          />
        )}
      </div>

      {/* Discussion Detail Modal */}
      <DiscussionDetailModal
        discussion={selectedDiscussion}
        open={Boolean(selectedDiscussion)}
        onClose={() => setSelectedDiscussionId(null)}
        onVote={(id, direction) => void handleVoteDiscussion(id, direction)}
        onAddComment={(id, content) => void handleAddDiscussionComment(id, content)}
        onVoteComment={(discussionId, commentId, direction) =>
          void handleVoteDiscussionComment(discussionId, commentId, direction)
        }
        onToggleBookmark={(id) => void handleUnsaveDiscussion(id)}
        onDelete={(id) => void handleDeleteDiscussion(id)}
        onDeleteComment={(discussionId, commentId) =>
          void handleDeleteDiscussionComment(discussionId, commentId)
        }
        currentUserId={currentUserId}
        isOwner={Boolean(selectedDiscussion) && selectedDiscussion?.author.id === currentUserId}
      />
    </div>
  );
}
