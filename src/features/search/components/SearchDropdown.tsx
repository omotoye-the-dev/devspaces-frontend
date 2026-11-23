import type { JSX } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { FiHash, FiUser, FiFileText, FiBox, FiMessageSquare } from "react-icons/fi";
import { HiOutlineClock } from "react-icons/hi2";
import { cn } from "@/shared/lib/utils/cn";
import { SectionHeader, Section, ResultRow } from "@/features/search/components/SearchResultParts";

import type { GlobalSearch } from "@/features/search/hooks/useGlobalSearch";

/** Dropdown under the search input: loading, recent searches, empty state or grouped results. */
export function SearchDropdown({ search }: { search: GlobalSearch }): JSX.Element {
  const {
    setQuery,
    setIsOpen,
    activeIndex,
    recentSearches,
    navigate,
    debouncedQuery,
    results,
    isLoading,
    saveRecent,
    handleSelect,
    articles,
    resources,
    discussions,
    tags,
    people,
    showEmpty,
    showRecents,
    getGlobalIndex,
  } = search;

  return (
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
          <p className="text-sm text-text/50">
            No results for <strong className="text-text/70">"{debouncedQuery}"</strong>
          </p>
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
              onViewAll={() => {
                setIsOpen(false);
                setQuery("");
              }}
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
              onViewAll={() => {
                setIsOpen(false);
                setQuery("");
              }}
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
              onViewAll={() => {
                setIsOpen(false);
                setQuery("");
              }}
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
            <Section icon={<FiHash className="w-3.5 h-3.5" />} label="Tags">
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
              onViewAll={() => {
                setIsOpen(false);
                setQuery("");
              }}
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
  );
}
