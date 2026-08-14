import type { ReactNode, JSX } from "react";
import { cn } from "@/lib/utils/cn";

export type EmptyStateSize = "sm" | "md" | "lg";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  size?: EmptyStateSize;
  bordered?: boolean;
  className?: string;
}

const sizeStyles: Record<
  EmptyStateSize,
  {
    container: string;
    iconWrapper: string;
    title: string;
    description: string;
    spacing: string;
  }
> = {
  sm: {
    container: "p-6",
    iconWrapper: "w-10 h-10 text-text/40 bg-border/40",
    title: "text-sm font-semibold",
    description: "text-xs max-w-xs",
    spacing: "gap-3",
  },
  md: {
    container: "p-8 sm:p-10",
    iconWrapper: "w-14 h-14 text-text/40 bg-border/40",
    title: "text-base sm:text-lg font-bold",
    description: "text-xs sm:text-sm max-w-sm",
    spacing: "gap-4",
  },
  lg: {
    container: "p-12 sm:p-16",
    iconWrapper: "w-18 h-18 text-text/40 bg-border/40",
    title: "text-xl sm:text-2xl font-bold",
    description: "text-sm sm:text-base max-w-md",
    spacing: "gap-6",
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  bordered = false,
  className,
}: EmptyStateProps): JSX.Element {
  const currentSize = sizeStyles[size];

  const defaultIcon = (
    <svg className="w-1/2 h-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  return (
    <div
      role="region"
      aria-label={typeof title === "string" ? title : "Empty state"}
      className={cn(
        "flex flex-col items-center justify-center text-center font-inter w-full",
        currentSize.container,
        currentSize.spacing,
        bordered
          ? "border-2 border-dashed border-border rounded-lg bg-background/50"
          : "bg-transparent",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-full flex items-center justify-center shrink-0 shadow-2xs",
          currentSize.iconWrapper,
        )}
      >
        {icon ?? defaultIcon}
      </div>

      <div className="space-y-1.5 flex flex-col items-center">
        <h3 className={cn("text-text tracking-tight", currentSize.title)}>{title}</h3>
        {description && (
          <p className={cn("text-text/60 leading-relaxed", currentSize.description)}>
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
