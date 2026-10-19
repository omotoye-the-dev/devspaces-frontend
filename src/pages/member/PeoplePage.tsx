import { useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiGrid, FiList, FiSearch } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { Avatar, Button, Skeleton, Tag } from "@/components/common";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils/cn";

type PeopleFilter = "all" | "active" | "recent";

type PeopleProfile = {
  id: string;
  name: string;
  username: string;
  role: string;
  bio: string;
  status: "online" | "away" | "offline";
  avatarUrl?: string | null;
  joinedAt?: string;
  contributions: {
    articlesCount: number;
    resourcesCount: number;
    discussionsCount: number;
    totalContributions: number;
  };
  followersCount: number;
  followingCount: number;
  githubUrl?: string | null;
};

type SocialLinks = {
  xUrl?: string | null;
  linkedInUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
};

type PeopleApiUser = {
  userId: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string | null;
  hasActiveSession?: boolean | null;
  joinedAt?: string | null;
  socialLinks?: SocialLinks | null;
  contributions?: {
    articlesCount?: number | null;
    resourcesCount?: number | null;
    discussionsCount?: number | null;
    totalContributions?: number | null;
  } | null;
  stats?: {
    followersCount?: number | null;
    followingCount?: number | null;
  } | null;
};

type PeopleEnvelope = {
  success?: boolean;
  message?: string;
  data?: unknown;
  errors?: unknown[] | null;
};

const PEOPLE_ENDPOINTS = [
  `${import.meta.env.VITE_API_BASE_URL ?? ""}/api/v1/people`,
  ENDPOINTS.AUTHORS.LIST,
  ENDPOINTS.USERS.LIST,
  ENDPOINTS.USER.LIST,
  ENDPOINTS.USER.ALL,
  ENDPOINTS.USERS.ALL,
];

const FILTERS: { id: PeopleFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "recent", label: "Recent" },
];

type PeopleView = "grid" | "list";

function normalizePeople(list: unknown): PeopleApiUser[] {
  if (!Array.isArray(list)) return [];

  return list.filter((item): item is PeopleApiUser => {
    return !!item && typeof item === "object" && "userId" in item;
  });
}

function extractPeopleUsers(payload: unknown): PeopleApiUser[] {
  if (!payload || typeof payload !== "object") return [];

  const envelope = payload as PeopleEnvelope;

  if (envelope.data && typeof envelope.data === "object") {
    const nested = envelope.data as Record<string, unknown>;

    if (Array.isArray(nested.people)) {
      return normalizePeople(nested.people);
    }

    if (Array.isArray(nested.items)) return normalizePeople(nested.items);
    if (Array.isArray(nested.users)) return normalizePeople(nested.users);
    if (Array.isArray(nested.results)) return normalizePeople(nested.results);
    if (Array.isArray(nested.authors)) return normalizePeople(nested.authors);
    if (Array.isArray(nested.members)) return normalizePeople(nested.members);
  }

  if (Array.isArray(payload)) return normalizePeople(payload);

  return [];
}

export default function PeoplePage(): JSX.Element {
  const navigate = useNavigate();
  const [people, setPeople] = useState<PeopleApiUser[]>([]);
  const [activeFilter, setActiveFilter] = useState<PeopleFilter>("all");
  const [view, setView] = useState<PeopleView>("grid");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchPeople(): Promise<void> {
      try {
        for (const endpoint of PEOPLE_ENDPOINTS) {
          try {
            const response = await apiClient.get<unknown>(endpoint);
            const users = extractPeopleUsers(response.data).filter((person) => {
              const normalizedName = [person.firstName, person.lastName].filter(Boolean).join(" ").trim().toLowerCase();
              const username = (person.username || "").trim().toLowerCase();

              return !(
                normalizedName === "jane doe" ||
                normalizedName === "liliana dahliarose" ||
                username === "janedoe" ||
                username === "lilianadahliarose"
              );
            });

            if (isMounted && users.length > 0) {
              setPeople(users);
              return;
            }
          } catch {
            // Try the next known endpoint.
          }
        }

        if (isMounted) {
          setPeople([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void fetchPeople();

    return () => {
      isMounted = false;
    };
  }, []);

  const peopleSource = useMemo<PeopleProfile[]>(() => {
    return people.map((person) => {
      const fullName =
        person.fullName?.trim() ||
        [person.firstName, person.lastName].filter(Boolean).join(" ").trim() ||
        person.username ||
        "Community Member";

      return {
        id: person.userId || "",
        name: fullName,
        username: person.username ? `@${person.username}` : "@member",
        role: person.role || "Member",
        bio: person.bio || "Community member",
        status: person.hasActiveSession ? "online" : "offline",
        avatarUrl: person.avatarUrl ?? null,
        joinedAt: person.joinedAt ?? undefined,
        contributions: {
          articlesCount: person.contributions?.articlesCount ?? 0,
          resourcesCount: person.contributions?.resourcesCount ?? 0,
          discussionsCount: person.contributions?.discussionsCount ?? 0,
          totalContributions: person.contributions?.totalContributions ?? 0,
        },
        followersCount: person.stats?.followersCount ?? 0,
        followingCount: person.stats?.followingCount ?? 0,
        githubUrl: person.socialLinks?.githubUrl ?? null,
      };
    });
  }, [people]);

  const [now] = useState(() => Date.now());

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLowerCase();

    return peopleSource.filter((person) => {
      const recentCutoff = 1000 * 60 * 60 * 24 * 30;
      const joinedAtTime = person.joinedAt ? new Date(person.joinedAt).getTime() : 0;

      const isActiveMatch =
        activeFilter === "all" ||
        (activeFilter === "active" && person.status === "online") ||
        (activeFilter === "recent" && Number.isFinite(joinedAtTime) && now - joinedAtTime < recentCutoff);

      const matchesQuery =
        query.length === 0 ||
        person.name.toLowerCase().includes(query) ||
        person.username.toLowerCase().includes(query) ||
        person.role.toLowerCase().includes(query) ||
        person.bio.toLowerCase().includes(query) ||
        (person.githubUrl ? person.githubUrl.toLowerCase().includes(query) : false);

      return isActiveMatch && matchesQuery;
    });
  }, [activeFilter, peopleSource, search, now]);

  return (
    <div className="min-h-screen w-full bg-background text-text">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/70">
              Community
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-text">People</h1>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative block w-full min-w-55 max-w-sm">
              <span className="sr-only">Search people</span>
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search people"
                className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-text placeholder:text-text/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </label>
          </div>
        </header>

        <section className="mb-6 rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    activeFilter === filter.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-text/60 hover:border-primary/30 hover:text-text",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="inline-flex rounded-full border border-border bg-background p-1">
              {[
                { id: "grid" as const, icon: FiGrid },
                { id: "list" as const, icon: FiList },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = view === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-label={`Switch to ${option.id} view`}
                    onClick={() => setView(option.id)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      isActive
                        ? "bg-white text-primary shadow-sm"
                        : "text-text/50 hover:text-text",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {isLoading ? (
          <section
            className={cn(
              view === "grid"
                ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                : "flex flex-col gap-4",
            )}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-2xl border border-border bg-white p-4 shadow-sm",
                  view === "list" && "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
                )}
              >
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton variant="text" width="60%" height={16} />
                    <Skeleton variant="text" width="40%" height={13} />
                  </div>
                </div>

                <div className={cn(view === "list" ? "flex-1 space-y-2" : "mt-4 space-y-2")}>
                  <Skeleton variant="text" width="30%" height={13} />
                  <Skeleton variant="text" width="90%" height={13} />
                </div>

                <div className={cn(view === "list" ? "grid w-full grid-cols-4 gap-2 md:w-[28rem]" : "mt-5 grid grid-cols-4 gap-2")}>
                  {Array.from({ length: 4 }).map((__, statIndex) => (
                    <Skeleton key={statIndex} variant="rounded" height={44} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : (
        <section
          className={cn(
            view === "grid"
              ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-4",
          )}
        >
          {filteredPeople.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => navigate(`/profile/${person.id}`)}
              className={cn(
                "group w-full rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md",
                view === "list" && "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
              )}
            >
              <div className={cn(view === "list" ? "flex min-w-0 items-center gap-3" : "flex items-start justify-between gap-3")}>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar src={person.avatarUrl || undefined} name={person.name} size="lg" href={null} status={person.status} />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-text">{person.name}</p>
                    <p className="truncate text-sm text-text/55">{person.username}</p>
                  </div>
                </div>

                <Tag variant={person.status === "online" ? "primary" : "neutral"} size="sm" className={cn(view === "list" && "hidden sm:inline-flex")}>
                  {person.status === "online" ? "Active" : "Offline"}
                </Tag>
              </div>

              <div className={cn(view === "list" ? "flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between" : "mt-4")}>
                <div className={cn(view === "list" ? "min-w-0" : "")}> 
                  <p className="text-sm font-medium text-text">{person.role}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-text/55">{person.bio}</p>
                </div>

                <div className={cn(view === "list" ? "flex flex-wrap gap-2 text-xs text-text/55" : "mt-4 flex flex-wrap gap-2 text-xs text-text/55")}>
                  <span className="rounded-full bg-background px-2 py-1">{person.followersCount} followers</span>
                  <span className="rounded-full bg-background px-2 py-1">{person.followingCount} following</span>
                </div>
              </div>

              <div className={cn(view === "list" ? "mt-4 grid w-full grid-cols-4 gap-2 md:mt-0 md:w-[28rem]" : "mt-5 grid grid-cols-4 gap-2")}>
                <div className="rounded-lg bg-background p-2 text-center">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-text/40">Articles</p>
                  <p className="mt-1 text-sm font-semibold text-text">{person.contributions.articlesCount}</p>
                </div>
                <div className="rounded-lg bg-background p-2 text-center">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-text/40">Resources</p>
                  <p className="mt-1 text-sm font-semibold text-text">{person.contributions.resourcesCount}</p>
                </div>
                <div className="rounded-lg bg-background p-2 text-center">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-text/40">Discuss</p>
                  <p className="mt-1 text-sm font-semibold text-text">{person.contributions.discussionsCount}</p>
                </div>
                <div className="rounded-lg bg-background p-2 text-center">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-text/40">Total</p>
                  <p className="mt-1 text-sm font-semibold text-text">{person.contributions.totalContributions}</p>
                </div>
              </div>

              <div className={cn(view === "list" ? "mt-4 flex items-center justify-between md:mt-0 md:min-w-40" : "mt-5 flex items-center justify-between")}>
                <span className="text-sm font-medium text-primary">
                  {person.githubUrl ? "View profile" : "Open profile"}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <FiArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          ))}
        </section>
        )}

        {!isLoading && filteredPeople.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-white p-8 text-center">
            <p className="flex items-center justify-center gap-2 text-base font-semibold text-text">
              <HiOutlineUserGroup className="h-5 w-5 text-primary" />
              No people match your filters
            </p>
            <p className="mt-1 text-sm text-text/50">Try another search term or segment.</p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button type="button" variant="primary" size="md">
            Explore community network
          </Button>
        </div>
      </div>
    </div>
  );
}
