import { useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiClock, FiMessageSquare, FiSearch } from "react-icons/fi";
import { Skeleton, Tag } from "@/components/common";
import { toast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { getArticleHistory, type Article } from "@/features/articles/api/articleApi";
import { getResourceHistory } from "@/features/resources/api/resources.api";
import type { ResourceListItem } from "@/types/resources.types";
import { getDiscussionHistory } from "@/features/discussions/api/discussionApi";
import type { Discussion } from "@/types/discussions.types";
import { cn } from "@/lib/utils/cn";

type HistoryFilter = "all" | "article" | "resource" | "discussion";

type HistoryEntry = {
  id: string;
  type: Exclude<HistoryFilter, "all">;
  title: string;
  description: string;
  category: string;
  author: string;
  createdAt: string;
  timeLabel: string;
  route: string;
  accent: string;
};

const HISTORY_ACCENTS = ["bg-primary", "bg-teal-500", "bg-amber-500", "bg-rose-500", "bg-violet-500"];

const formatRelativeTime = (value?: string | null): string => {
  if (!value) {
    return "Recently";
  }

  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const mapArticleToHistoryEntry = (article: Article, index: number): HistoryEntry => {
  const description =
    article.excerpt ||
    article.content
      ?.replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim() ||
    "No description available.";

  const authorName =
    article.author?.name ||
    article.author?.userName ||
    article.author?.username ||
    "DevSpace member";

  const category = article.tags?.[0] || "General";
  const createdAt = article.createdAt;

  return {
    id: article.id,
    type: "article",
    title: article.title,
    description,
    category,
    author: authorName,
    createdAt,
    timeLabel: formatRelativeTime(createdAt),
    route: `/articles/${article.id}`,
    accent: HISTORY_ACCENTS[index % HISTORY_ACCENTS.length],
  };
};

const mapResourceToHistoryEntry = (resource: ResourceListItem, index: number): HistoryEntry => {
  const authorName = resource.uploader?.name || resource.uploader?.username || "DevSpace member";
  const createdAt = resource.createdAt;

  return {
    id: resource.id,
    type: "resource",
    title: resource.title,
    description: resource.description || "No description available.",
    category: resource.category || "General",
    author: authorName,
    createdAt,
    timeLabel: formatRelativeTime(createdAt),
    route: `/resources/${resource.id}`,
    accent: HISTORY_ACCENTS[index % HISTORY_ACCENTS.length],
  };
};

const mapDiscussionToHistoryEntry = (discussion: Discussion, index: number): HistoryEntry => {
  const authorName = discussion.author?.name || discussion.author?.username || "DevSpace member";
  const createdAt = discussion.createdAt;
  const description = discussion.content?.trim()
    ? discussion.content.length > 200
      ? `${discussion.content.slice(0, 200).trim()}...`
      : discussion.content
    : "No description available.";

  return {
    id: discussion.id,
    type: "discussion",
    title: discussion.title,
    description,
    category: discussion.tags?.[0] || "General",
    author: authorName,
    createdAt,
    timeLabel: formatRelativeTime(createdAt),
    route: "/discussions",
    accent: HISTORY_ACCENTS[index % HISTORY_ACCENTS.length],
  };
};

function HistoryPage(): JSX.Element {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async (): Promise<void> => {
      try {
        setIsLoading(true);

        const [articlesResult, resourcesResult, discussionsResult] = await Promise.allSettled([
          getArticleHistory({ page: 1, pageSize: 20 }),
          getResourceHistory({ page: 1, pageSize: 20 }),
          getDiscussionHistory(),
        ]);

        const articleEntries =
          articlesResult.status === "fulfilled"
            ? articlesResult.value.data.map((article, index) => mapArticleToHistoryEntry(article, index))
            : [];

        const resourceEntries =
          resourcesResult.status === "fulfilled"
            ? resourcesResult.value.data.map((resource, index) => mapResourceToHistoryEntry(resource, index))
            : [];

        const discussionEntries =
          discussionsResult.status === "fulfilled"
            ? discussionsResult.value.map((discussion, index) => mapDiscussionToHistoryEntry(discussion, index))
            : [];

        if (
          articlesResult.status === "rejected" &&
          resourcesResult.status === "rejected" &&
          discussionsResult.status === "rejected"
        ) {
          toast.error(getApiErrorMessage(articlesResult.reason, "Failed to load history"));
        }

        const combined = [...articleEntries, ...resourceEntries, ...discussionEntries].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setEntries(combined);
      } catch (error) {
        console.error("Failed to load history entries:", error);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHistory();
  }, []);

  const visibleEntries = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesType = filter === "all" || entry.type === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        entry.title.toLowerCase().includes(normalizedQuery) ||
        entry.description.toLowerCase().includes(normalizedQuery) ||
        entry.author.toLowerCase().includes(normalizedQuery) ||
        entry.category.toLowerCase().includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [entries, filter, search]);

  const summary = useMemo(
    () => ({
      total: entries.length,
      articles: entries.filter((entry) => entry.type === "article").length,
      resources: entries.filter((entry) => entry.type === "resource").length,
      discussions: entries.filter((entry) => entry.type === "discussion").length,
    }),
    [entries],
  );

  const filters: { id: HistoryFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "article", label: "Articles" },
    { id: "resource", label: "Resources" },
    { id: "discussion", label: "Discussions" },
  ];

  return (
    <>
      <div className="min-h-screen w-full bg-background text-text">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/70">
              Activity
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-text">History</h1>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text/45">
                Total
              </p>
              <FiClock className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-4 text-3xl font-bold text-text">{summary.total}</p>
            <p className="mt-1 text-xs text-text/50">Saved items in your activity timeline</p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text/45">
                Articles
              </p>
              <FiBookOpen className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-4 text-3xl font-bold text-text">{summary.articles}</p>
            <p className="mt-1 text-xs text-text/50">Read and visited article pages</p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text/45">
                Resources
              </p>
              <FiBookOpen className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-4 text-3xl font-bold text-text">{summary.resources}</p>
            <p className="mt-1 text-xs text-text/50">Resource pages opened and reviewed</p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text/45">
                Discussions
              </p>
              <FiMessageSquare className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-4 text-3xl font-bold text-text">{summary.discussions}</p>
            <p className="mt-1 text-xs text-text/50">Questions and discussions visited</p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    filter === option.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-text/60 hover:border-primary/30 hover:text-text",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label className="relative block w-full max-w-sm">
              <span className="sr-only">Search history</span>
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search history"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-text placeholder:text-text/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </label>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl border border-border bg-white p-4"
              >
                <Skeleton variant="rounded" width={6} height={48} className="mt-1 rounded-full" />
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton variant="rounded" width={70} height={18} />
                    <Skeleton variant="text" width={80} height={12} />
                  </div>
                  <Skeleton variant="text" width="70%" height={18} />
                  <Skeleton variant="text" width="100%" height={14} />
                  <Skeleton variant="rounded" width={72} height={20} />
                </div>
              </div>
            ))
          ) : visibleEntries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-white p-8 text-center">
              <p className="text-base font-semibold text-text">No matching history yet</p>
              <p className="mt-1 text-sm text-text/50">
                Open some articles or resources to populate your timeline.
              </p>
            </div>
          ) : (
            visibleEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => navigate(entry.route)}
                className="group flex w-full items-start gap-3 rounded-xl border border-border bg-white p-4 text-left shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <div className={cn("mt-1 h-12 w-1.5 rounded-full", entry.accent)} />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-text/50">
                        {entry.type}
                      </span>
                      <span className="text-[11px] font-medium text-text/45">{entry.timeLabel}</span>
                    </div>

                    <div className="flex items-center gap-2 text-text/50">
                      <span className="text-[11px] font-medium">{entry.author}</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-text transition-colors group-hover:text-primary">
                        {entry.title}
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-text/60">{entry.description}</p>
                    </div>

                    <div className="hidden shrink-0 sm:flex">
                      <FiArrowRight className="h-4 w-4 text-text/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Tag variant="neutral" size="sm">
                      {entry.category}
                    </Tag>
                  </div>
                </div>
              </button>
            ))
          )}
        </section>
        </div>
      </div>
    </>
  );
}

export default HistoryPage;
