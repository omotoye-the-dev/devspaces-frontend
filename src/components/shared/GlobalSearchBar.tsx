import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type JSX,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineSearch } from "react-icons/md";
import { FiX, FiHash, FiUser, FiFileText, FiBox, FiMessageSquare } from "react-icons/fi";
import { HiOutlineClock } from "react-icons/hi2";
import { cn } from "@/lib/utils/cn";
import { getFeedArticles } from "@/features/articles/api/articleApi";
import { getTags, type Tag } from "@/features/articles/api/tagApi";
import { getDiscussions } from "@/features/discussions/api/discussionApi";
import { getResources } from "@/features/resources/api/resources.api";
import type { ResourceListItem } from "@/types/resources.types";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { UserProfile } from "@/lib/api/user.api";

// ─── Result shapes ─────────────────────────────────────────────────────────────

interface ArticleResult {
  kind: "article";
  id: string;
  title: string;
  excerpt?: string;
  authorName?: string;
}

interface ResourceResult {
  kind: "resource";
  id: string;
  title: string;
  description?: string;
  category?: string;
}

interface DiscussionResult {
  kind: "discussion";
  id: string;
  title: string;
  commentsCount: number;
}

interface TagResult {
  kind: "tag";
  name: string;
  slug?: string;
  usageCount?: number;
}

interface PersonResult {
  kind: "person";
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  role?: string;
}

type SearchResult =
  | ArticleResult
  | ResourceResult
  | DiscussionResult
  | TagResult
  | PersonResult;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const MAX_PER_SECTION = 3;

function filterArticles(items: Awaited<ReturnType<typeof getFeedArticles>>["data"], q: string): ArticleResult[] {
  const lower = q.toLowerCase();
  return items
    .filter(
      (a) =>
        a.title?.toLowerCase().includes(lower) ||
        a.excerpt?.toLowerCase().includes(lower),
    )
    .slice(0, MAX_PER_SECTION)
    .map((a) => ({
      kind: "article" as const,
      id: a.id,
      title: a.title || "Untitled",
      excerpt: a.excerpt ?? undefined,
      authorName: a.authorName ?? (a.author as { name?: string } | null)?.name,
    }));
}

function filterTags(tags: Tag[], q: string): TagResult[] {
  const lower = q.toLowerCase();
  return tags
    .filter((t) => t.name.toLowerCase().includes(lower))
    .slice(0, MAX_PER_SECTION)
    .map((t) => ({ kind: "tag" as const, name: t.name, slug: t.slug, usageCount: t.usageCount }));
}

// ─── Component ─────────────────────────────────────────────────────────────────

export interface GlobalSearchBarProps {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  /** If true, renders as a full-width block (used in mobile overlay) */
  fullWidth?: boolean;
}

export function GlobalSearchBar({
  className,
  inputClassName,
  placeholder = "Search articles, resources, discussions, people…",
  fullWidth = false,
}: GlobalSearchBarProps): JSX.Element {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(query.trim(), 300);
  const hasMinQuery = debouncedQuery.length >= 2;
  const [rawResults, setRawResults] = useState<{ query: string; items: SearchResult[] }>({
    query: "",
    items: [],
  });

  const results = hasMinQuery && rawResults.query === debouncedQuery ? rawResults.items : [];
  const isLoading = hasMinQuery && rawResults.query !== debouncedQuery;
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("devspace_recent_searches") ?? "[]") as string[];
    } catch {
      return [];
    }
  });

  // ── Close on click outside / Escape ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: globalThis.KeyboardEvent): void {
      if (e.key === "Escape") {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    function handleClick(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen]);

  // ── Parallel search across all entities ──────────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return;
    }

    let cancelled = false;

    async function runSearch(): Promise<void> {
      const q = debouncedQuery;

      const [articlesRes, tagsRes, discussionsRes, resourcesRes, usersRes] =
        await Promise.allSettled([
          getFeedArticles({ page: 1, pageSize: 20 }),
          getTags({ pageSize: 50 }),
          getDiscussions({ search: q }),
          getResources({ search: q, pageSize: 5, page: 1 }),
          apiClient.get<{ data?: UserProfile[] } | UserProfile[]>(
            ENDPOINTS.USER.ALL ?? ENDPOINTS.USER.LIST,
            { params: { search: q, pageSize: 5 } },
          ),
        ]);

      if (cancelled) return;

      const combined: SearchResult[] = [];

      // Articles
      if (articlesRes.status === "fulfilled") {
        combined.push(...filterArticles(articlesRes.value.data ?? [], q));
      }

      // Resources
      if (resourcesRes.status === "fulfilled") {
        const items: ResourceListItem[] = resourcesRes.value.data ?? [];
        const filtered = items
          .filter(
            (r) =>
              r.title.toLowerCase().includes(q.toLowerCase()) ||
              r.description.toLowerCase().includes(q.toLowerCase()),
          )
          .slice(0, MAX_PER_SECTION)
          .map((r): ResourceResult => ({
            kind: "resource",
            id: r.id,
            title: r.title,
            description: r.description,
            category: r.category,
          }));
        combined.push(...filtered);
      }

      // Discussions
      if (discussionsRes.status === "fulfilled") {
        const discussions = discussionsRes.value
          .filter(
            (d) =>
              d.title.toLowerCase().includes(q.toLowerCase()) ||
              d.content.toLowerCase().includes(q.toLowerCase()),
          )
          .slice(0, MAX_PER_SECTION)
          .map((d): DiscussionResult => ({
            kind: "discussion",
            id: d.id,
            title: d.title,
            commentsCount: d.commentsCount,
          }));
        combined.push(...discussions);
      }

      // Tags
      if (tagsRes.status === "fulfilled") {
        combined.push(...filterTags(tagsRes.value, q));
      }

      // People
      if (usersRes.status === "fulfilled") {
        const body = usersRes.value.data;
        const people: UserProfile[] = Array.isArray(body)
          ? body
          : Array.isArray((body as { data?: UserProfile[] })?.data)
            ? ((body as { data: UserProfile[] }).data)
            : [];

        const personResults: PersonResult[] = people
          .filter((u) => {
            const name = (u.name ?? u.fullName ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()).toLowerCase();
            const uname = (u.username ?? u.userName ?? "").toLowerCase();
            return name.includes(q.toLowerCase()) || uname.includes(q.toLowerCase());
          })
          .slice(0, MAX_PER_SECTION)
          .map((u): PersonResult => ({
            kind: "person",
            id: (u.id ?? "") as string,
            name: (u.name ?? u.fullName ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()) || (u.username ?? u.userName ?? "Unknown"),
            username: (u.username ?? u.userName ?? "") as string,
            avatarUrl: u.avatarUrl ?? u.avatar ?? u.profilePictureUrl,
            role: u.role,
          }));

        combined.push(...personResults);
      }

      if (!cancelled) {
        setRawResults({ query: q, items: combined });
        setActiveIndex(-1);
      }
    }

    void runSearch().catch(() => {
      if (!cancelled) setRawResults({ query: debouncedQuery, items: [] });
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // ── Navigation on result select ───────────────────────────────────────────────
  const saveRecent = useCallback((term: string): void => {
    setRecentSearches((prev) => {
      const next = [term, ...prev.filter((s) => s !== term)].slice(0, 5);
      localStorage.setItem("devspace_recent_searches", JSON.stringify(next));
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (result: SearchResult): void => {
      setIsOpen(false);
      setQuery("");
      switch (result.kind) {
        case "article":
          saveRecent(result.title);
          navigate(`/articles/${result.id}`);
          break;
        case "resource":
          saveRecent(result.title);
          navigate(`/resources?id=${result.id}`);
          break;
        case "discussion":
          saveRecent(result.title);
          navigate(`/discussions`);
          break;
        case "tag":
          saveRecent(`#${result.name}`);
          navigate(`/articles?tag=${encodeURIComponent(result.slug ?? result.name)}`);
          break;
        case "person":
          saveRecent(result.name);
          navigate(`/profile/${result.id}`);
          break;
      }
    },
    [navigate, saveRecent],
  );

  // ── Keyboard navigation ───────────────────────────────────────────────────────
  const flatResults: SearchResult[] = results;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && flatResults[activeIndex]) {
        handleSelect(flatResults[activeIndex]);
      } else if (query.trim()) {
        // Full search → navigate to articles with query
        saveRecent(query.trim());
        navigate(`/articles?search=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        setQuery("");
      }
    }
  };

  // ── Grouped results for rendering ────────────────────────────────────────────
  const articles = results.filter((r): r is ArticleResult => r.kind === "article");
  const resources = results.filter((r): r is ResourceResult => r.kind === "resource");
  const discussions = results.filter((r): r is DiscussionResult => r.kind === "discussion");
  const tags = results.filter((r): r is TagResult => r.kind === "tag");
  const people = results.filter((r): r is PersonResult => r.kind === "person");

  const showEmpty = debouncedQuery.length >= 2 && !isLoading && results.length === 0;
  const showRecents = !debouncedQuery && recentSearches.length > 0;

  function getGlobalIndex(result: SearchResult): number {
    return flatResults.indexOf(result);
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", fullWidth ? "w-full" : "w-full max-w-lg", className)}
    >
      {/* Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none">
          <MdOutlineSearch className="w-4.5 h-4.5" />
        </span>
        <input
          ref={inputRef}
          id="global-search-input"
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={placeholder}
          aria-label="Global search"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="global-search-listbox"
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-border bg-background/70",
            "placeholder:text-text/40",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
            "transition-all duration-150",
            inputClassName,
          )}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setRawResults({ query: "", items: [] });
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text/40 hover:text-text transition-colors"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="global-search-listbox"
          role="listbox"
          aria-label="Search results"
          className={cn(
            "absolute top-full mt-2 w-full z-200",
            "bg-white border border-border rounded-xl shadow-xl overflow-hidden",
            "animate-in fade-in-0 slide-in-from-top-1 duration-150",
          )}
        >
          {/* Loading shimmer */}
          {isLoading && (
            <div className="px-4 py-3 space-y-2.5">
              {[80, 65, 75, 55].map((w, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-border/40 animate-pulse shrink-0" />
                  <div
                    className="h-3.5 rounded bg-border/40 animate-pulse"
                    style={{ width: `${w}%` }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Recent searches (no query) */}
          {!isLoading && showRecents && (
            <div>
              <SectionHeader icon={<HiOutlineClock className="w-3.5 h-3.5" />} label="Recent" />
              {recentSearches.map((term) => (
                <button
                  key={term}
                  role="option"
                  aria-selected={false}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    setIsOpen(true);
                  }}
                  className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-text/80 hover:bg-primary/5 transition-colors text-left"
                >
                  <HiOutlineClock className="w-4 h-4 text-text/30 shrink-0" />
                  <span className="flex-1 truncate">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && showEmpty && (
            <div className="px-4 py-8 text-center">
              <MdOutlineSearch className="w-8 h-8 text-text/20 mx-auto mb-2" />
              <p className="text-sm text-text/50">No results for <strong className="text-text/70">"{debouncedQuery}"</strong></p>
              <p className="text-xs text-text/40 mt-1">Try a different keyword</p>
            </div>
          )}

          {/* Results */}
          {!isLoading && results.length > 0 && (
            <div className="py-1 max-h-120 overflow-y-auto hover-scrollbar">

              {/* Articles */}
              {articles.length > 0 && (
                <Section
                  icon={<FiFileText className="w-3.5 h-3.5" />}
                  label="Articles"
                  viewAllHref={`/articles?search=${encodeURIComponent(debouncedQuery)}`}
                  onViewAll={() => { setIsOpen(false); setQuery(""); }}
                >
                  {articles.map((r) => (
                    <ResultRow
                      key={r.id}
                      icon={<FiFileText className="w-3.5 h-3.5 text-blue-500" />}
                      primary={r.title}
                      secondary={r.authorName ? `by ${r.authorName}` : r.excerpt}
                      isActive={getGlobalIndex(r) === activeIndex}
                      onClick={() => handleSelect(r)}
                    />
                  ))}
                </Section>
              )}

              {/* Resources */}
              {resources.length > 0 && (
                <Section
                  icon={<FiBox className="w-3.5 h-3.5" />}
                  label="Resources"
                  viewAllHref={`/resources?search=${encodeURIComponent(debouncedQuery)}`}
                  onViewAll={() => { setIsOpen(false); setQuery(""); }}
                >
                  {resources.map((r) => (
                    <ResultRow
                      key={r.id}
                      icon={<FiBox className="w-3.5 h-3.5 text-violet-500" />}
                      primary={r.title}
                      secondary={r.category ?? r.description}
                      isActive={getGlobalIndex(r) === activeIndex}
                      onClick={() => handleSelect(r)}
                    />
                  ))}
                </Section>
              )}

              {/* Discussions */}
              {discussions.length > 0 && (
                <Section
                  icon={<FiMessageSquare className="w-3.5 h-3.5" />}
                  label="Discussions"
                  viewAllHref={`/discussions`}
                  onViewAll={() => { setIsOpen(false); setQuery(""); }}
                >
                  {discussions.map((r) => (
                    <ResultRow
                      key={r.id}
                      icon={<FiMessageSquare className="w-3.5 h-3.5 text-emerald-500" />}
                      primary={r.title}
                      secondary={`${r.commentsCount} ${r.commentsCount === 1 ? "reply" : "replies"}`}
                      isActive={getGlobalIndex(r) === activeIndex}
                      onClick={() => handleSelect(r)}
                    />
                  ))}
                </Section>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <Section
                  icon={<FiHash className="w-3.5 h-3.5" />}
                  label="Tags"
                >
                  {tags.map((r) => (
                    <ResultRow
                      key={r.name}
                      icon={<FiHash className="w-3.5 h-3.5 text-amber-500" />}
                      primary={`#${r.name}`}
                      secondary={r.usageCount !== undefined ? `${r.usageCount} articles` : undefined}
                      isActive={getGlobalIndex(r) === activeIndex}
                      onClick={() => handleSelect(r)}
                    />
                  ))}
                </Section>
              )}

              {/* People */}
              {people.length > 0 && (
                <Section
                  icon={<FiUser className="w-3.5 h-3.5" />}
                  label="People"
                  viewAllHref={`/people`}
                  onViewAll={() => { setIsOpen(false); setQuery(""); }}
                >
                  {people.map((r) => (
                    <ResultRow
                      key={r.id}
                      icon={
                        r.avatarUrl ? (
                          <img
                            src={r.avatarUrl}
                            alt={r.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                            {r.name[0]}
                          </span>
                        )
                      }
                      primary={r.name}
                      secondary={`@${r.username}${r.role ? ` · ${r.role}` : ""}`}
                      isActive={getGlobalIndex(r) === activeIndex}
                      onClick={() => handleSelect(r)}
                    />
                  ))}
                </Section>
              )}

              {/* Footer: full search */}
              <div className="border-t border-border/50 px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => {
                    saveRecent(debouncedQuery);
                    navigate(`/articles?search=${encodeURIComponent(debouncedQuery)}`);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-2 text-xs text-primary hover:underline font-medium"
                >
                  <MdOutlineSearch className="w-3.5 h-3.5" />
                  See all results for &quot;{debouncedQuery}&quot;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
}: {
  icon: JSX.Element;
  label: string;
}): JSX.Element {
  return (
    <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
      <span className="text-text/40">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-text/40">
        {label}
      </span>
    </div>
  );
}

function Section({
  icon,
  label,
  viewAllHref,
  onViewAll,
  children,
}: {
  icon: JSX.Element;
  label: string;
  viewAllHref?: string;
  onViewAll?: () => void;
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-text/40">{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text/40">
            {label}
          </span>
        </div>
        {viewAllHref && onViewAll && (
          <button
            type="button"
            onClick={() => {
              onViewAll();
              navigate(viewAllHref);
            }}
            className="text-[10px] text-primary hover:underline font-medium"
          >
            See all
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function ResultRow({
  icon,
  primary,
  secondary,
  isActive,
  onClick,
}: {
  icon: JSX.Element;
  primary: string;
  secondary?: string;
  isActive: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      role="option"
      aria-selected={isActive}
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center w-full gap-3 px-4 py-2.5 text-left transition-colors",
        isActive ? "bg-primary/8 text-primary" : "hover:bg-primary/5 text-text",
      )}
    >
      <span className="shrink-0 flex items-center justify-center w-5 h-5">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium leading-tight truncate">{primary}</span>
        {secondary && (
          <span className="block text-xs text-text/50 truncate mt-0.5">{secondary}</span>
        )}
      </span>
    </button>
  );
}

export default GlobalSearchBar;
