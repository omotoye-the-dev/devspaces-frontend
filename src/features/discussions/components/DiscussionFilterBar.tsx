import { useEffect, useState, type JSX } from "react";
import {
  HiOutlineArrowTrendingUp,
  HiOutlineClock,
  HiOutlineChatBubbleLeftRight,
  HiXMark,
} from "react-icons/hi2";
import { MdOutlineSearch, MdClear } from "react-icons/md";
import { Input } from "@/components/common";
import { cn } from "@/lib/utils/cn";
import { getTags } from "@/features/articles/api/tagApi";
import type { DiscussionSortOption } from "@/types/discussions.types";

export interface DiscussionFilterBarProps {
  activeSort: DiscussionSortOption;
  onSortChange: (sort: DiscussionSortOption) => void;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  availableTags: string[];
}

const SORT_OPTIONS: Array<{
  id: DiscussionSortOption;
  label: string;
  icon: JSX.Element;
}> = [
  {
    id: "trending",
    label: "Trending",
    icon: <HiOutlineArrowTrendingUp className="w-4 h-4" />,
  },
  {
    id: "latest",
    label: "Latest",
    icon: <HiOutlineClock className="w-4 h-4" />,
  },
  {
    id: "most_answered",
    label: "Most Answered",
    icon: <HiOutlineChatBubbleLeftRight className="w-4 h-4" />,
  },
];

export function DiscussionFilterBar({
  activeSort,
  onSortChange,
  selectedTag,
  onTagSelect,
  searchQuery,
  onSearchChange,
  availableTags,
}: DiscussionFilterBarProps): JSX.Element {
  const [popularTags, setPopularTags] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    getTags({ pageSize: 20 })
      .then((tags) => {
        if (active) setPopularTags(tags.map((t) => t.name));
      })
      .catch(() => {
        if (active) setPopularTags([]);
      });

    return () => {
      active = false;
    };
  }, []);

  // Merge tags fetched from the backend with any dynamically created tags, removing duplicates
  const allTags = Array.from(new Set([...availableTags, ...popularTags]));

  return (
    <div className="space-y-3.5 bg-white border border-border rounded-lg p-3 sm:p-4 shadow-2xs">
      {/* Top row: Search and Sort tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Sort option tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-background rounded-lg border border-border/60">
          {SORT_OPTIONS.map((opt) => {
            const isActive = activeSort === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSortChange(opt.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-white text-primary shadow-xs"
                    : "text-text/60 hover:text-text hover:bg-white/50",
                )}
              >
                <span className={isActive ? "text-primary" : "text-text/50"}>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative sm:w-64 md:w-72">
          <Input
            placeholder="Search questions or topics..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<MdOutlineSearch className="w-4 h-4 text-text/40" />}
            rightIcon={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search"
                  className="text-text/40 hover:text-text cursor-pointer"
                >
                  <MdClear className="w-4 h-4" />
                </button>
              ) : undefined
            }
          />
        </div>
      </div>

      {/* Tags row */}
      <div className="pt-2 border-t border-border/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text/40 shrink-0">
          Topics:
        </span>

        {/* All topics pill */}
        <button
          type="button"
          onClick={() => onTagSelect(null)}
          className={cn(
            "text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-150 shrink-0 cursor-pointer",
            selectedTag === null
              ? "bg-primary text-white shadow-2xs font-semibold"
              : "bg-background text-text/60 hover:bg-border/60 hover:text-text",
          )}
        >
          All Topics
        </button>

        {/* Individual tag pills */}
        {allTags.map((tag) => {
          const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onTagSelect(isSelected ? null : tag)}
              className={cn(
                "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-150 shrink-0 cursor-pointer",
                isSelected
                  ? "bg-primary text-white shadow-2xs font-semibold"
                  : "bg-background text-text/60 hover:bg-border/60 hover:text-text",
              )}
            >
              <span>#{tag}</span>
              {isSelected && <HiXMark className="w-3 h-3 text-white/80" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
