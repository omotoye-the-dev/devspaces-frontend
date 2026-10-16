import { useEffect, useMemo, useState, type JSX } from "react";
import { FiSearch } from "react-icons/fi";
import { HiOutlineTrophy } from "react-icons/hi2";
import { Avatar, Skeleton, Tag } from "@/components/common";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils/cn";

type LeaderboardCategoryKey = "articles" | "resources" | "discussions";

type LeaderboardUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  role: string;
  points: number;
  badge: string;
};

type LeaderboardCategory = {
  categoryName: string;
  description: string;
  topContributors: LeaderboardUser[];
};

type LeaderboardApiResponse = {
  success?: boolean;
  message?: string;
  data?: Record<string, unknown> | null;
  errors?: string[] | null;
};

const DEFAULT_DESCRIPTIONS: Record<LeaderboardCategoryKey, string> = {
  articles: "Top published authors by article likes, views, and comments engagement.",
  resources: "Top resource contributors by upvotes, downloads, and saves.",
  discussions: "Top active commenters by community participation on discussion threads.",
};

const EMPTY_LEADERBOARD: Record<LeaderboardCategoryKey, LeaderboardCategory> = {
  articles: {
    categoryName: "Articles",
    description: DEFAULT_DESCRIPTIONS.articles,
    topContributors: [],
  },
  resources: {
    categoryName: "Resources",
    description: DEFAULT_DESCRIPTIONS.resources,
    topContributors: [],
  },
  discussions: {
    categoryName: "Discussions",
    description: DEFAULT_DESCRIPTIONS.discussions,
    topContributors: [],
  },
};

const CATEGORY_OPTIONS: { id: LeaderboardCategoryKey; label: string }[] = [
  { id: "articles", label: "Articles" },
  { id: "resources", label: "Resources" },
  { id: "discussions", label: "Discussions" },
];

const FALLBACK_LEADERBOARD: Record<LeaderboardCategoryKey, LeaderboardUser[]> = {
  articles: [],
  resources: [],
  discussions: [],
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeLeaderboardUser(raw: Record<string, unknown>, fallbackLabel: string): LeaderboardUser {
  const fullName =
    (typeof raw.fullName === "string" && raw.fullName.trim()) ||
    (typeof raw.name === "string" && raw.name.trim()) ||
    [raw.firstName, raw.lastName].filter((item): item is string => typeof item === "string" && Boolean(item.trim())).join(" ") ||
    (typeof raw.username === "string" && raw.username.trim()) ||
    fallbackLabel;

  const username =
    typeof raw.username === "string" && raw.username.trim()
      ? `@${raw.username.trim()}`
      : typeof raw.userName === "string" && raw.userName.trim()
        ? `@${raw.userName.trim()}`
        : "@member";

  return {
    id: String(raw.userId ?? raw.id ?? `${fullName}-${username}`),
    name: fullName,
    username,
    avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : undefined,
    role: typeof raw.role === "string" && raw.role.trim() ? raw.role : "Member",
    points: toNumber(
      raw.totalScore ?? raw.TotalScore ?? raw.points ?? raw.totalPoints ?? raw.score,
      0,
    ),
    badge: typeof raw.badge === "string" && raw.badge.trim() ? raw.badge : "Contributor",
  };
}

function normalizeLeaderboardCategory(raw: unknown, fallbackLabel: string, fallbackDescription: string): LeaderboardCategory {
  if (!raw || typeof raw !== "object") {
    return {
      categoryName: fallbackLabel,
      description: fallbackDescription,
      topContributors: [],
    };
  }

  const data = raw as Record<string, unknown>;
  const contributorSource =
    Array.isArray(data.topContributors)
      ? data.topContributors
      : Array.isArray(data.contributors)
        ? data.contributors
        : Array.isArray(data.items)
          ? data.items
          : [];

  return {
    categoryName: typeof data.categoryName === "string" && data.categoryName.trim() ? data.categoryName : fallbackLabel,
    description:
      typeof data.description === "string" && data.description.trim()
        ? data.description
        : fallbackDescription,
    topContributors: contributorSource.map((item) =>
      normalizeLeaderboardUser((item && typeof item === "object" ? item : {}) as Record<string, unknown>, fallbackLabel),
    ),
  };
}

function resolveLeaderboardPayload(data: Record<string, unknown> | null | undefined): Record<LeaderboardCategoryKey, LeaderboardCategory> {
  const fallback = { ...EMPTY_LEADERBOARD };

  if (!data || typeof data !== "object") {
    return fallback;
  }

  const selected: Record<LeaderboardCategoryKey, LeaderboardCategory> = { ...fallback };

  const categoryMapping: Record<LeaderboardCategoryKey, string> = {
    articles: "articlesLeaderboard",
    resources: "resourcesLeaderboard",
    discussions: "discussionsLeaderboard",
  };

  (Object.keys(categoryMapping) as LeaderboardCategoryKey[]).forEach((key) => {
    const payloadKey = categoryMapping[key];
    const rawValue = data[payloadKey];
    selected[key] = normalizeLeaderboardCategory(
      rawValue,
      CATEGORY_OPTIONS.find((option) => option.id === key)?.label ?? key,
      DEFAULT_DESCRIPTIONS[key],
    );
  });

  if (selected.articles.topContributors.length === 0 && Array.isArray(data.articles)) {
    selected.articles = normalizeLeaderboardCategory(data.articles, "Articles", DEFAULT_DESCRIPTIONS.articles);
  }
  if (selected.resources.topContributors.length === 0 && Array.isArray(data.resources)) {
    selected.resources = normalizeLeaderboardCategory(data.resources, "Resources", DEFAULT_DESCRIPTIONS.resources);
  }
  if (selected.discussions.topContributors.length === 0 && Array.isArray(data.discussions)) {
    selected.discussions = normalizeLeaderboardCategory(data.discussions, "Discussions", DEFAULT_DESCRIPTIONS.discussions);
  }

  return selected;
}

export default function LeaderboardPage(): JSX.Element {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategoryKey>("articles");
  const [search, setSearch] = useState("");
  const [apiMessage, setApiMessage] = useState<string>("");
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [leaderboardResponse, setLeaderboardResponse] = useState<Record<LeaderboardCategoryKey, LeaderboardCategory>>({ ...EMPTY_LEADERBOARD });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchLeaderboard(): Promise<void> {
      try {
        const response = await apiClient.get<LeaderboardApiResponse>(ENDPOINTS.LEADERBOARD);
        if (!isMounted) return;

        setApiMessage(response.data.message ?? "");
        setApiErrors(Array.isArray(response.data.errors) ? response.data.errors : []);
        setLeaderboardResponse(resolveLeaderboardPayload(response.data.data ?? null));
      } catch {
        if (!isMounted) return;
        setApiMessage("Leaderboard data is temporarily unavailable.");
        setApiErrors(["Unable to fetch leaderboard data."]);
        setLeaderboardResponse({ ...EMPTY_LEADERBOARD });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void fetchLeaderboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const leaderboardData = useMemo(() => {
    return leaderboardResponse[activeCategory] ?? EMPTY_LEADERBOARD[activeCategory];
  }, [activeCategory, leaderboardResponse]);

  const rankedUsers = useMemo(() => {
    const source = leaderboardData.topContributors.length > 0 ? leaderboardData.topContributors : FALLBACK_LEADERBOARD[activeCategory];
    const query = search.trim().toLowerCase();

    if (!query) return source;

    return source.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query),
    );
  }, [activeCategory, leaderboardData, search]);

  const topThree = rankedUsers.slice(0, 3);
  const hasApiErrors = apiErrors.length > 0;

  return (
    <div className="min-h-screen w-full bg-background text-text">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/70">
              Community
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-text">Leaderboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative block w-full max-w-sm">
              <span className="sr-only">Search leaderboard</span>
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search members"
                className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-text placeholder:text-text/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </label>
          </div>
        </header>

        {hasApiErrors && (
          <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {apiMessage || "Leaderboard data is temporarily unavailable."}
          </section>
        )}

        <section className="mb-6 rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveCategory(option.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    activeCategory === option.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-text/60 hover:border-primary/30 hover:text-text",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-medium uppercase tracking-[0.18em] text-text/45">
              {leaderboardData.categoryName}
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-text/60">{leaderboardData.description}</p>
        </section>

        {isLoading ? (
          <>
            <section className="mb-6 grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="rounded" width={70} height={20} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width={48} height={48} />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton variant="text" width="70%" height={18} />
                      <Skeleton variant="text" width="50%" height={14} />
                    </div>
                  </div>
                  <Skeleton variant="text" width="40%" height={14} />
                  <div className="space-y-1.5">
                    <Skeleton variant="text" width={50} height={11} />
                    <Skeleton variant="text" width={80} height={24} />
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-border bg-white shadow-sm divide-y divide-border">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-4 py-4">
                  <Skeleton variant="circular" width={36} height={36} />
                  <Skeleton variant="circular" width={36} height={36} />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton variant="text" width="40%" height={14} />
                    <Skeleton variant="text" width="25%" height={12} />
                  </div>
                  <Skeleton variant="rounded" width={70} height={32} />
                </div>
              ))}
            </section>
          </>
        ) : (leaderboardData.topContributors.length === 0 && !hasApiErrors) ? (
          <section className="rounded-xl border border-dashed border-border bg-white p-8 text-center">
            <p className="text-base font-semibold text-text">No contributors yet</p>
            <p className="mt-1 text-sm text-text/50">
              {leaderboardData.categoryName} rankings will appear here once community activity starts coming in.
            </p>
          </section>
        ) : (
          <>
            <section className="mb-6 grid gap-4 md:grid-cols-3">
              {topThree.map((user, index) => (
                <div
                  key={user.id}
                  className={cn(
                    "rounded-2xl border bg-white p-5 shadow-sm transition-all",
                    index === 0 && "border-primary/30 bg-linear-to-br from-primary/5 to-white",
                    index === 1 && "border-slate-200",
                    index === 2 && "border-amber-200",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full font-bold text-white",
                        index === 0 && "bg-primary",
                        index === 1 && "bg-slate-500",
                        index === 2 && "bg-amber-500",
                      )}
                    >
                      #{index + 1}
                    </span>
                    <Tag variant={index === 0 ? "primary" : "neutral"} size="sm">
                      {user.badge}
                    </Tag>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <Avatar
                      src={user.avatarUrl}
                      name={user.name}
                      size="lg"
                      href={null}
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-text">{user.name}</p>
                      <p className="truncate text-sm text-text/55">{user.username}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-text/60">{user.role}</p>

                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text/40">
                      Points
                    </p>
                    <p className="mt-1 text-2xl font-bold text-text">{user.points.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-border bg-white shadow-sm">
              <div className="border-b border-border px-4 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-text/50">
                    Rankings
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-medium text-text/50">
                    <HiOutlineTrophy className="h-4 w-4 text-primary" />
                    {rankedUsers.length} members
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border">
                {rankedUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white",
                          index === 0 && "bg-primary",
                          index === 1 && "bg-slate-500",
                          index === 2 && "bg-amber-500",
                          index > 2 && "bg-slate-200 text-slate-700",
                        )}
                      >
                        {index + 1}
                      </div>

                      <Avatar
                        src={user.avatarUrl}
                        name={user.name}
                        size="md"
                        href={null}
                        className="shrink-0"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-text">{user.name}</p>
                          <span className="text-xs text-text/45">{user.username}</span>
                        </div>
                        <p className="text-xs text-text/50">{user.role}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <div className="rounded-lg bg-background px-2.5 py-1.5 text-center">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-text/40">Points</p>
                        <p className="mt-1 text-sm font-semibold text-text">{user.points}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {rankedUsers.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-base font-semibold text-text">No members match your search.</p>
                  <p className="mt-1 text-sm text-text/50">Try another name or role.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
