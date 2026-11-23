import { useEffect, useRef, useState, useCallback, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getFeedArticles } from "@/features/articles/api/articleApi";
import { getDiscussions } from "@/features/discussions/api/discussionApi";
import { getResources } from "@/features/resources/api/resources.api";
import type { ResourceListItem } from "@/features/resources/types/resources.types";
import { apiClient } from "@/shared/lib/api/client";
import { ENDPOINTS } from "@/shared/lib/api/endpoints";
import type { UserProfile } from "@/features/profile/api/user.api";
import { STORAGE_KEYS, storage } from "@/shared/lib/storage";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { MAX_PER_SECTION, filterArticles, filterTags } from "@/features/search/utils/searchFilters";
import type {
  ArticleResult,
  ResourceResult,
  DiscussionResult,
  TagResult,
  PersonResult,
  SearchResult,
} from "@/features/search/types";
import { queryClient } from "@/shared/lib/queryClient";
import { tagsQuery } from "@/features/articles/api/tagQueries";

/**
 * Global search state: debounced query, parallel fetches across articles,
 * resources, discussions, tags and people, keyboard navigation and recents.
 */
export function useGlobalSearch() {
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
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    storage.getJSON<string[]>(STORAGE_KEYS.recentSearches, []),
  );

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
          queryClient.fetchQuery(tagsQuery(50)),
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
            ? (body as { data: UserProfile[] }).data
            : [];

        const personResults: PersonResult[] = people
          .filter((u) => {
            const name = (
              u.name ??
              u.fullName ??
              `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
            ).toLowerCase();
            const uname = (u.username ?? u.userName ?? "").toLowerCase();
            return name.includes(q.toLowerCase()) || uname.includes(q.toLowerCase());
          })
          .slice(0, MAX_PER_SECTION)
          .map((u): PersonResult => ({
            kind: "person",
            id: (u.id ?? "") as string,
            name:
              (u.name ?? u.fullName ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()) ||
              (u.username ?? u.userName ?? "Unknown"),
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
      storage.setJSON(STORAGE_KEYS.recentSearches, next);
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

  return {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    activeIndex,
    setActiveIndex,
    rawResults,
    setRawResults,
    recentSearches,
    setRecentSearches,
    navigate,
    containerRef,
    inputRef,
    debouncedQuery,
    hasMinQuery,
    results,
    isLoading,
    saveRecent,
    handleSelect,
    flatResults,
    handleKeyDown,
    articles,
    resources,
    discussions,
    tags,
    people,
    showEmpty,
    showRecents,
    getGlobalIndex,
  };
}

export type GlobalSearch = ReturnType<typeof useGlobalSearch>;
