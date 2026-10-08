import type { JSX } from "react";
import {
  RESOURCE_CATEGORIES,
  type ResourceCategory,
} from "@/features/resources/constants/resourceCategories";
import { cn } from "@/lib/utils/cn";

export interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categories?: ResourceCategory[];
  counts?: Record<string, number>;
  className?: string;
}

export function CategoryPills({
  selectedCategory,
  onSelectCategory,
  categories = RESOURCE_CATEGORIES,
  counts,
  className,
}: CategoryPillsProps): JSX.Element {
  return (
    <div
      role="tablist"
      aria-label="Category Filters"
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 overflow-x-auto slim-scrollbar pb-1 select-none w-full min-w-0 overscroll-x-contain",
        className,
      )}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory.toLowerCase() === category.id.toLowerCase();
        const count = counts?.[category.id.toLowerCase()];

        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap shrink-0",
              isSelected
                ? "bg-primary text-white shadow-2xs font-semibold"
                : "bg-white border border-border text-text/70 hover:text-text hover:bg-slate-50",
            )}
          >
            <span
              className={cn(
                "shrink-0 transition-colors",
                isSelected ? "text-white" : "text-text/50",
              )}
            >
              {category.icon}
            </span>
            <span>{category.label}</span>
            {typeof count === "number" && (
              <span
                className={cn(
                  "text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded-full ml-0.5",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-text/60",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
