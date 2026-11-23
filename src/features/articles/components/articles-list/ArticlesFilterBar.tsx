import type { JSX } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { LuLayoutGrid, LuLayoutList, LuX } from "react-icons/lu";
import { Input } from "@/shared/ui";
import { ArticleSearchDropdown } from "@/features/articles/components/ArticleSearchDropdown";

import type { UseArticlesListResult } from "@/features/articles/hooks/useArticlesList";

/** Search, feed/sort controls, layout toggle and active tag chip. */
export function ArticlesFilterBar({ list }: { list: UseArticlesListResult }): JSX.Element {
  const {
    searchQuery,
    setSearchQuery,
    isDropdownOpen,
    setIsDropdownOpen,
    layout,
    setLayout,
    navigate,
    selectedCategory,
    setSelectedCategory,
  } = list;

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search container with 2-column dropdown */}
          <div className="relative flex-1 max-w-xl">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onClick={() => setIsDropdownOpen(true)}
              placeholder="Search by keyword, tag, or topic..."
              inputSize="md"
              leftIcon={<MdOutlineSearch className="text-text/40 text-lg" />}
              rightIcon={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                    }}
                    className="p-1 text-text/40 hover:text-text cursor-pointer transition-colors"
                    title="Clear search"
                  >
                    <LuX className="w-4 h-4" />
                  </button>
                ) : undefined
              }
              className="bg-white border-border shadow-2xs"
            />

            <ArticleSearchDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              searchQuery={searchQuery}
              selectedTag={selectedCategory}
              onSelectTag={(tagName) => {
                setSelectedCategory(tagName);
                setSearchQuery("");
                setIsDropdownOpen(false);
              }}
              onSelectTopic={(topic) => {
                setIsDropdownOpen(false);
                navigate(`/articles/${topic.id}`);
              }}
            />
          </div>

          {/* Layout toggle */}
          <div className="flex items-center bg-white border border-border rounded-lg overflow-hidden shrink-0 self-end sm:self-auto shadow-2xs">
            <button
              type="button"
              id="layout-list"
              onClick={() => setLayout("list")}
              title="List view"
              className={`p-2 transition-colors cursor-pointer ${
                layout === "list"
                  ? "bg-primary text-white"
                  : "text-text/50 hover:bg-slate-50 hover:text-text"
              }`}
            >
              <LuLayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="layout-grid"
              onClick={() => setLayout("grid")}
              title="Grid view"
              className={`p-2 transition-colors cursor-pointer ${
                layout === "grid"
                  ? "bg-primary text-white"
                  : "text-text/50 hover:bg-slate-50 hover:text-text"
              }`}
            >
              <LuLayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active tag filter indicator */}
        {selectedCategory !== "All" && (
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-xs text-text/50 font-medium">Filtered by tag:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-[0_0_12px_rgba(99,102,241,0.6)]">
              #{selectedCategory}
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className="hover:text-white/80 p-0.5 rounded-full cursor-pointer ml-0.5"
                title="Clear tag filter"
              >
                <LuX className="w-3.5 h-3.5" />
              </button>
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className="text-xs text-text/50 hover:text-primary transition-colors cursor-pointer underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </>
  );
}
