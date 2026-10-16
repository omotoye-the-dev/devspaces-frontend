import { useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiClock, FiSearch, FiTrash2 } from "react-icons/fi";
import { Button, Modal, Tag } from "@/components/common";
import { getFeedArticles, type Article } from "@/features/articles/api/articleApi";
import { cn } from "@/lib/utils/cn";

type HistoryFilter = "all" | "article" | "resource";

type HistoryEntry = {
  id: string;
  type: Exclude<HistoryFilter, "all">;
  title: string;
  description: string;
  category: string;
  author: string;
  timeLabel: string;
  route: string;
  accent: string;
};

const HISTORY_ACCENTS = ["bg-primary", "bg-teal-500", "bg-amber-500", "bg-rose-500", "bg-violet-500"];
const HISTORY_DELETE_STORAGE_KEY = "devspace-history-cleared";

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

  return {
    id: article.id,
    type: "article",
    title: article.title,
    description,
    category,
    author: authorName,
    timeLabel: formatRelativeTime(article.createdAt),
    route: `/articles/${article.id}`,
    accent: HISTORY_ACCENTS[index % HISTORY_ACCENTS.length],
  };
};

function HistoryPage(): JSX.Element {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async (): Promise<void> => {
      try {
        if (typeof window !== "undefined" && window.localStorage.getItem(HISTORY_DELETE_STORAGE_KEY) === "true") {
          setEntries([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        const response = await getFeedArticles({ page: 1, pageSize: 20 });
        const mappedEntries = response.data.map((article, index) =>
          mapArticleToHistoryEntry(article, index),
        );
        setEntries(mappedEntries);
      } catch (error) {
        console.error("Failed to load history entries:", error);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHistory();
  }, []);

  const handleDeleteHistory = (): void => {
    setEntries([]);
    setFilter("all");
    setSearch("");
    setIsDeleteModalOpen(false);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(HISTORY_DELETE_STORAGE_KEY, "true");
    }
  };

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
      recent: entries.filter((entry) => entry.timeLabel.includes("hour") || entry.timeLabel.includes("day")).length,
    }),
    [entries],
  );

  const filters: { id: HistoryFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "article", label: "Articles" },
    { id: "resource", label: "Resources" },
  ];

  return (
    <>
      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete history permanently?"
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-3 text-rose-800">
            <FiTrash2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-xs leading-relaxed">
              <p className="font-semibold">This will permanently remove your browsing history on this device.</p>
              <p className="mt-1 text-rose-700">
                You will need to reload your recent activity before it appears again.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={handleDeleteHistory} leftIcon={<FiTrash2 className="h-4 w-4" />}>
              Delete history
            </Button>
          </div>
        </div>
      </Modal>

      <div className="min-h-screen w-full bg-background text-text">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/70">
              Activity
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-text">History</h1>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<FiTrash2 className="w-4 h-4" />}
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={entries.length === 0 || isLoading}
          >
            Clear history
          </Button>
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
                Recent
              </p>
              <FiClock className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-4 text-3xl font-bold text-text">{summary.recent}</p>
            <p className="mt-1 text-xs text-text/50">Updated in the last few days</p>
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
            <div className="mt-6 rounded-xl border border-border bg-white p-8 text-center">
              <p className="text-base font-semibold text-text">Loading history...</p>
            </div>
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
