import type { JSX } from "react";
import { Select } from "@/shared/ui";
import { MdSort } from "react-icons/md";
import { CategoryPills } from "@/features/resources/components/CategoryPills";
import { SORT_OPTIONS } from "@/features/resources/constants/resourceListOptions";
import type { UseResourcesListResult } from "@/features/resources/hooks/useResourcesList";

/** Category pills and sort dropdown. */
export function ResourcesFilters({ list }: { list: UseResourcesListResult }): JSX.Element {
  const { selectedCategory, sortBy, categoryCounts, handleSelectCategory, handleSelectSort } = list;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4">
        <div className="w-full sm:w-auto min-w-0 flex-1">
          <CategoryPills
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            counts={categoryCounts}
          />
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <Select
            fullWidth={false}
            selectSize="md"
            aria-label="Sort resources"
            leftIcon={<MdSort className="w-full h-full" />}
            value={sortBy}
            onChange={(e) => handleSelectSort(e.target.value)}
            options={SORT_OPTIONS}
            className="border-border hover:border-primary/50 rounded-lg text-xs sm:text-sm font-semibold bg-white text-text/80 shadow-2xs w-full sm:min-w-48"
          />
        </div>
      </div>
    </>
  );
}
