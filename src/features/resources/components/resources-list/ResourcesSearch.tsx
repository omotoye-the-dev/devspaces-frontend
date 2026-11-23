import type { JSX } from "react";
import { Input } from "@/shared/ui";
import { MdOutlineSearch, MdClear } from "react-icons/md";

import type { UseResourcesListResult } from "@/features/resources/hooks/useResourcesList";

/** Search input. */
export function ResourcesSearch({ list }: { list: UseResourcesListResult }): JSX.Element {
  const { searchQuery, setSearchQuery } = list;

  return (
    <>
      <div className="relative">
        <Input
          placeholder="Search resources, topics, keywords..."
          className="border-border focus:ring-primary pr-9 text-xs sm:text-sm"
          leftIcon={<MdOutlineSearch className="text-text/40 text-lg" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text/40 hover:text-text rounded-full transition-colors"
            aria-label="Clear search query"
          >
            <MdClear className="w-4 h-4" />
          </button>
        )}
      </div>
    </>
  );
}
