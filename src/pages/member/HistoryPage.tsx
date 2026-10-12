import { useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiClock, FiSearch, FiTrash2 } from "react-icons/fi";
import { Button, Tag } from "@/components/common";
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

const initialHistory: HistoryEntry[] = [
  {
    id: "h-1",
    type: "article",
    title: "Designing resilient React applications with TanStack Query",
    description: "A practical guide to handling loading, cache invalidation, and optimistic UI updates.",
    category: "React",
    author: "Aisha Khan",
    timeLabel: "2 hours ago",
    route: "/articles/1",
    accent: "bg-primary",
  },
  {
    id: "h-2",
    type: "resource",
    title: "Type-safe API integration checklist",
    description: "A curated set of frontend standards and validation tips for safe data access.",
    category: "TypeScript",
    author: "DevSpace Team",
    timeLabel: "Yesterday",
    route: "/resources/1",
    accent: "bg-teal-500",
  },
  {
    id: "h-3",
    type: "article",
    title: "Shipping faster with focused CI pipelines",
    description: "How to reduce feedback time and keep release quality high without over-engineering.",
    category: "DevOps",
    author: "Marcus Lee",
    timeLabel: "3 days ago",
    route: "/articles/2",
    accent: "bg-amber-500",
  },
  {
    id: "h-4",
    type: "resource",
    title: "Authentication patterns for modern web apps",
    description: "A resource collection covering session, token, and social login flows.",
    category: "Security",
    author: "Nora James",
    timeLabel: "Last week",
    route: "/resources/2",
    accent: "bg-rose-500",
  },
  {
    id: "h-5",
    type: "article",
    title: "What I learned from building sustainable design systems",
    description: "Patterns for scaling components without introducing churn and inconsistency.",
    category: "Design",
    author: "Lena Ortiz",
    timeLabel: "Last week",
    route: "/articles/3",
    accent: "bg-violet-500",
  },
];

function HistoryPage(): JSX.Element {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<HistoryEntry[]>(initialHistory);

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
    <div className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
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
            onClick={() => setEntries([])}
            disabled={entries.length === 0}
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
          {visibleEntries.length === 0 ? (
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
  );
}

export default HistoryPage;
