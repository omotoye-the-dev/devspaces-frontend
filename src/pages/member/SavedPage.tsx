import { useEffect, useMemo, useState, type JSX } from "react";
import { FiBookmark, FiMessageSquare } from "react-icons/fi";
import { MdOutlineSearch, MdClear } from "react-icons/md";
import { Input, Tabs, EmptyState, Skeleton } from "@/components/common";
import { ArticleCard } from "@/features/articles/components/ArticleCard";
import { ResourceCard, type ResourceItem } from "@/features/resources/components/ResourceCard";
import { getSavedArticles, saveArticle, type Article } from "@/features/articles/api/articleApi";
import { getSavedResources, saveResource } from "@/features/resources/api/resources.api";
import type { ResourceListItem } from "@/types/resources.types";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { toast } from "@/hooks/useToast";

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
  const [activeTab, setActiveTab] = useState<SavedTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [articles, setArticles] = useState<Article[]>([]);
  const [resources, setResources] = useState<ResourceListItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedItems(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        const [articlesRes, resourcesRes] = await Promise.allSettled([
          getSavedArticles(),
          getSavedResources(),
        ]);

        if (!isMounted) return;

        if (articlesRes.status === "fulfilled") {
          setArticles(articlesRes.value.data);
        }
        if (resourcesRes.status === "fulfilled") {
          setResources(resourcesRes.value.data || []);
        }

        if (articlesRes.status === "rejected" && resourcesRes.status === "rejected") {
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

  const totalCount = articles.length + resources.length;

  const tabItems = [
    { id: "all", label: "All", count: totalCount },
    { id: "articles", label: "Articles", count: articles.length },
    { id: "resources", label: "Resources", count: resources.length },
    { id: "discussions", label: "Discussions", count: 0 },
  ];

  const showArticles = activeTab === "all" || activeTab === "articles";
  const showResources = activeTab === "all" || activeTab === "resources";
  const showDiscussions = activeTab === "discussions";

  const visibleCount =
    (showArticles ? filteredArticles.length : 0) + (showResources ? filteredResources.length : 0);

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
        ) : showDiscussions ? (
          <EmptyState
            size="lg"
            bordered
            icon={<FiMessageSquare className="w-8 h-8 text-primary" />}
            title="Saved discussions aren't available yet"
            description="We're still building the ability to save discussions. Check back soon."
            className="py-16 sm:py-20 bg-white"
          />
        ) : visibleCount > 0 ? (
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
                <ResourceCard
                  key={`resource-${resource.id}`}
                  resource={mapToResourceCardItem(resource)}
                  onBookmark={() => void handleUnsaveResource(resource.id)}
                />
              ))}
          </div>
        ) : (
          <EmptyState
            size="lg"
            bordered
            icon={<FiBookmark className="w-8 h-8 text-primary" />}
            title={search ? "No matching saved items" : "Nothing saved yet"}
            description={
              search
                ? `No saved items match "${search}". Try a different search.`
                : "Bookmark articles and resources to find them here later."
            }
            className="py-16 sm:py-20 bg-white"
          />
        )}
      </div>
    </div>
  );
}
