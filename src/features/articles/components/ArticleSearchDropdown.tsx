import { useEffect, useState, useMemo, useRef, type JSX } from "react";
import { clsx } from "clsx";
import { LuTag, LuTrendingUp, LuFlame, LuClock, LuEye } from "react-icons/lu";
import { AiOutlineHeart } from "react-icons/ai";
import { getTags, type Tag } from "@/features/articles/api/tagApi";
import { getTrendingPosts, type TrendingPost } from "@/features/articles/api/articleApi";
import { Skeleton } from "@/components/common";

export interface ArticleSearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  selectedTag?: string;
  onSelectTag: (tagName: string) => void;
  onSelectTopic: (topic: TrendingPost) => void;
}

export function ArticleSearchDropdown({
  isOpen,
  onClose,
  searchQuery,
  selectedTag,
  onSelectTag,
  onSelectTopic,
}: ArticleSearchDropdownProps): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);

  const [tags, setTags] = useState<Tag[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState<boolean>(true);

  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState<boolean>(true);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        onClose();
      }
    }

    function handleClickOutside(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fetch all popular tags once on mount
  useEffect(() => {
    let cancelled = false;

    async function loadTags(): Promise<void> {
      try {
        setIsTagsLoading(true);
        const data = await getTags({ pageSize: 50 });
        if (!cancelled) {
          setTags(data);
        }
      } catch {
        if (!cancelled) setTags([]);
      } finally {
        if (!cancelled) setIsTagsLoading(false);
      }
    }

    void loadTags();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch trending topics (with debounced search query support)
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      async function loadTrending(): Promise<void> {
        try {
          setIsTrendingLoading(true);
          const trimmedQuery = searchQuery.trim();
          const data = await getTrendingPosts({
            pageSize: 15,
            search: trimmedQuery || undefined,
          });
          if (!cancelled) {
            setTrendingPosts(data);
          }
        } catch {
          if (!cancelled) setTrendingPosts([]);
        } finally {
          if (!cancelled) setIsTrendingLoading(false);
        }
      }

      void loadTrending();
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Filter popular tags based on current search query
  const filteredTags = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.name.toLowerCase().includes(q));
  }, [tags, searchQuery]);

  // Filter trending posts if query is provided (both from API and in-memory safety)
  const filteredTrending = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return trendingPosts;
    return trendingPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [trendingPosts, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Search suggestions"
      className="absolute left-0 top-full mt-2 w-full md:w-170 bg-white border border-border/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/70 max-h-115">
        {/* ── Left Column: Popular Tags ───────────────────────────── */}
        <div className="p-4 sm:p-5 flex flex-col min-w-0 bg-slate-50/40">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <LuTag className="w-4 h-4" />
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-text uppercase tracking-wider">
                Popular Tags
              </h3>
            </div>
            {!isTagsLoading && filteredTags.length > 0 && (
              <span className="text-[11px] font-medium text-text/50 bg-white border border-border/80 px-2 py-0.5 rounded-full">
                {filteredTags.length}
              </span>
            )}
          </div>

          <p className="text-[11px] text-text/50 mb-3">
            Click to filter articles by tag.
          </p>

          <div className="flex-1 overflow-y-auto pr-1 max-h-64 sm:max-h-80 space-y-1.5 scrollbar-thin">
            {isTagsLoading ? (
              <div className="space-y-2 py-1">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-border/40">
                    <Skeleton variant="text" width={90} height={14} />
                    <Skeleton variant="rounded" width={24} height={16} />
                  </div>
                ))}
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="py-8 text-center text-xs text-text/50 space-y-1">
                <p className="font-semibold text-text/70">No tags found</p>
                <p className="text-[11px]">
                  {searchQuery ? `No tags matching "${searchQuery}"` : "No tags available"}
                </p>
              </div>
            ) : (
              filteredTags.map((tag) => {
                const isTagActive = Boolean(
                  selectedTag &&
                    selectedTag.trim().toLowerCase() !== "all" &&
                    tag.name.trim().toLowerCase() === selectedTag.trim().toLowerCase(),
                );
                return (
                  <button
                    key={tag.id || tag.name}
                    type="button"
                    onClick={() => onSelectTag(tag.name)}
                    className={clsx(
                      "w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer group",
                      isTagActive
                        ? "bg-primary text-white font-semibold shadow-xs"
                        : "bg-white border border-border/70 text-text hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                    )}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className={clsx("font-bold text-xs", isTagActive ? "text-white" : "text-primary")}>
                        #
                      </span>
                      <span className="truncate">{tag.name}</span>
                    </span>

                    {typeof tag.usageCount === "number" && (
                      <span
                        className={clsx(
                          "text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium",
                          isTagActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-text/60 group-hover:bg-primary/10 group-hover:text-primary",
                        )}
                      >
                        {tag.usageCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Column: Trending Topics ───────────────────────── */}
        <div className="p-4 sm:p-5 flex flex-col min-w-0 bg-white">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <LuTrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                Trending Topics
                <LuFlame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              </h3>
            </div>
            {!isTrendingLoading && filteredTrending.length > 0 && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Hot
              </span>
            )}
          </div>

          <p className="text-[11px] text-text/50 mb-3">
            Click any topic to read its discussion.
          </p>

          <div className="flex-1 overflow-y-auto pr-1 max-h-64 sm:max-h-80 space-y-2.5 scrollbar-thin">
            {isTrendingLoading ? (
              <div className="space-y-3 py-1">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-border/40 space-y-2 bg-slate-50/50">
                    <Skeleton variant="text" width="80%" height={14} />
                    <Skeleton variant="text" width="50%" height={10} />
                  </div>
                ))}
              </div>
            ) : filteredTrending.length === 0 ? (
              <div className="py-8 text-center text-xs text-text/50 space-y-1">
                <p className="font-semibold text-text/70">No trending topics</p>
                <p className="text-[11px]">
                  {searchQuery
                    ? `No trending topics matching "${searchQuery}"`
                    : "No trending topics found at this time."}
                </p>
              </div>
            ) : (
              filteredTrending.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onSelectTopic(topic)}
                  className="w-full text-left p-3 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-all duration-150 cursor-pointer group flex flex-col gap-1.5 shadow-2xs"
                >
                  <h4 className="text-xs sm:text-sm font-semibold text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {topic.title}
                  </h4>

                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-text/50">
                    {topic.author?.userName || topic.author?.name ? (
                      <span className="font-medium text-text/70 truncate max-w-30">
                        @{topic.author?.userName || topic.author?.name}
                      </span>
                    ) : null}

                    {typeof topic.viewCount === "number" && (
                      <span className="flex items-center gap-1">
                        <LuEye className="w-3 h-3" />
                        <span>{topic.viewCount}</span>
                      </span>
                    )}

                    {typeof topic.likeCount === "number" && (
                      <span className="flex items-center gap-1">
                        <AiOutlineHeart className="w-3 h-3" />
                        <span>{topic.likeCount}</span>
                      </span>
                    )}

                    {typeof topic.readingTimeMinutes === "number" && topic.readingTimeMinutes > 0 && (
                      <span className="flex items-center gap-1 ml-auto">
                        <LuClock className="w-3 h-3" />
                        <span>{topic.readingTimeMinutes}m</span>
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Dropdown Footer ────────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-border/60 flex items-center justify-between text-[11px] text-text/50">
        <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-border text-[10px] font-mono text-text/70">Esc</kbd> to close</span>
        <button
          type="button"
          onClick={onClose}
          className="text-text/60 hover:text-text font-medium cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ArticleSearchDropdown;
