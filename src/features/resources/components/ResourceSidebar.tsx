import type { JSX } from "react";
import { FiBookmark } from "react-icons/fi";
import { Button } from "@/components/common";
import { cn } from "@/lib/utils/cn";
import {
  RESOURCE_CATEGORIES,
  type ResourceCategory,
} from "@/features/resources/constants/resourceCategories";

export type { ResourceCategory };

export interface ResourceSidebarProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onAddResource?: () => void;
  counts?: Record<string, number>;
  className?: string;
}

export function ResourceSidebar({
  selectedCategory,
  onSelectCategory,
  onAddResource,
  counts,
  className,
}: ResourceSidebarProps): JSX.Element {
  return (
    <aside
      className={cn(
        "hidden lg:flex w-64 flex-col justify-between shrink-0 bg-white border-r border-border h-full p-4 select-none overflow-y-auto hover-scrollbar",
        className,
      )}
    >
      {/* Top: Category List */}
      <div className="space-y-4">
        <h2 className="px-3 text-sm font-bold text-text tracking-tight">Categories</h2>

        <nav className="flex flex-col gap-1" aria-label="Resource Categories">
          {RESOURCE_CATEGORIES.map((category) => {
            const isSelected = selectedCategory.toLowerCase() === category.id.toLowerCase();
            const count = counts?.[category.id.toLowerCase()];

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left w-full",
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                    : "text-text/70 hover:text-text hover:bg-slate-100/70",
                )}
              >
                <span
                  className={cn(
                    "shrink-0 transition-colors",
                    isSelected ? "text-primary" : "text-text/50",
                  )}
                >
                  {category.icon}
                </span>
                <span className="truncate flex-1">{category.label}</span>
                {typeof count === "number" && (
                  <span
                    className={cn(
                      "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-text/60",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Share Knowledge Promo Card */}
      <div className="p-4 bg-slate-50/80 border border-border/80 rounded-xl flex flex-col items-center text-center mt-6 shadow-2xs">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
          <FiBookmark className="w-4 h-4 fill-primary/20" />
        </div>
        <h3 className="text-xs font-bold text-text leading-tight">
          Share knowledge, build community
        </h3>
        <p className="text-[11px] text-text/60 leading-snug mt-1.5 mb-3.5">
          Contribute resources that help developers learn and grow together.
        </p>
        <Button
          type="button"
          variant="primary"
          size="sm"
          fullWidth
          onClick={onAddResource}
          className="text-xs font-semibold py-2"
        >
          Add Resource
        </Button>
      </div>
    </aside>
  );
}
