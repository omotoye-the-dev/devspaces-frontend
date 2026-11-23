import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils/cn";

/* Building blocks for the search dropdown sections. */

export function SectionHeader({ icon, label }: { icon: JSX.Element; label: string }): JSX.Element {
  return (
    <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
      <span className="text-text/40">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-text/40">{label}</span>
    </div>
  );
}

export function Section({
  icon,
  label,
  viewAllHref,
  onViewAll,
  children,
}: {
  icon: JSX.Element;
  label: string;
  viewAllHref?: string;
  onViewAll?: () => void;
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-text/40">{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text/40">
            {label}
          </span>
        </div>
        {viewAllHref && onViewAll && (
          <button
            type="button"
            onClick={() => {
              onViewAll();
              navigate(viewAllHref);
            }}
            className="text-[10px] text-primary hover:underline font-medium"
          >
            See all
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function ResultRow({
  icon,
  primary,
  secondary,
  isActive,
  onClick,
}: {
  icon: JSX.Element;
  primary: string;
  secondary?: string;
  isActive: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      role="option"
      aria-selected={isActive}
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center w-full gap-3 px-4 py-2.5 text-left transition-colors",
        isActive ? "bg-primary/8 text-primary" : "hover:bg-primary/5 text-text",
      )}
    >
      <span className="shrink-0 flex items-center justify-center w-5 h-5">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium leading-tight truncate">{primary}</span>
        {secondary && (
          <span className="block text-xs text-text/50 truncate mt-0.5">{secondary}</span>
        )}
      </span>
    </button>
  );
}
