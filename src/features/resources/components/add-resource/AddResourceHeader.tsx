import type { JSX } from "react";
import { Avatar, Tooltip } from "@/shared/ui";
import { useAuthStore } from "@/store";
import { cn } from "@/shared/lib/utils/cn";
import { CATEGORIES, type CategoryConfig, type ResourceCategoryType } from "./addResource.config";
import { FiX, FiMaximize2, FiMinimize2, FiChevronDown } from "react-icons/fi";

interface AddResourceHeaderProps {
  category: ResourceCategoryType;
  currentConfig: CategoryConfig;
  categoryDropdownOpen: boolean;
  onCategoryDropdownOpenChange: (open: boolean) => void;
  onCategorySelect: (category: ResourceCategoryType) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onRequestClose: () => void;
}

export function AddResourceHeader({
  category,
  currentConfig,
  categoryDropdownOpen,
  onCategoryDropdownOpenChange,
  onCategorySelect,
  isExpanded,
  onToggleExpanded,
  onRequestClose,
}: AddResourceHeaderProps): JSX.Element {
  const user = useAuthStore((state) => state.user);

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3.5 sm:px-5 pt-3 sm:pt-4 pb-2 select-none border-b border-border/40 shrink-0",
        isExpanded && "px-4 sm:px-8 pt-4 sm:pt-5",
      )}
    >
      {/* Left: User Avatar + Category Dropdown Picker */}
      <div className="relative flex items-center gap-2 sm:gap-2.5">
        <Avatar
          name={
            [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
            user?.userName ||
            user?.username ||
            "User"
          }
          src={user?.avatarUrl || undefined}
          size="sm"
          href={null}
          className="ring-1 ring-border"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => onCategoryDropdownOpenChange(!categoryDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 text-text font-semibold text-xs border border-border/60 transition-colors"
          >
            <span>{currentConfig.icon}</span>
            <span>{currentConfig.label}</span>
            <FiChevronDown className="w-3 h-3 text-text/50" />
          </button>

          {/* Category Popover Menu */}
          {categoryDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => onCategoryDropdownOpenChange(false)}
              />
              <div className="absolute top-full left-0 mt-1.5 z-40 w-52 bg-white border border-border rounded-xl shadow-lg p-1.5 space-y-0.5">
                <p className="text-[10px] font-bold text-text/40 uppercase tracking-wider px-2 py-1">
                  Choose Category
                </p>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onCategorySelect(cat.id)}
                    className={cn(
                      "flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors",
                      category === cat.id
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-text/80 hover:bg-slate-100 hover:text-text",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {cat.icon}
                      <span>{cat.label}</span>
                    </div>
                    <span className="text-[10px] text-text/40 uppercase">{cat.defaultMode}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Header Icons */}
      <div className="flex items-center gap-1 text-text/50">
        <Tooltip content={isExpanded ? "Exit full screen" : "Expand full screen"}>
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-label={isExpanded ? "Collapse view" : "Expand full screen"}
            className="p-1.5 rounded-md hover:text-text hover:bg-slate-100 transition-colors"
          >
            {isExpanded ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
          </button>
        </Tooltip>

        <Tooltip content="Close (Esc)">
          <button
            type="button"
            onClick={onRequestClose}
            aria-label="Close modal"
            className="p-1.5 rounded-md hover:text-text hover:bg-slate-100 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
