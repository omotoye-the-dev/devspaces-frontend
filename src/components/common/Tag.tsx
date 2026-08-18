import type { HTMLAttributes, ReactNode, MouseEvent, JSX } from "react";
import { cn } from "@/lib/utils/cn";

export type TagVariant =
  "primary" | "teal" | "neutral" | "success" | "warning" | "danger" | "outline";

export type TagSize = "sm" | "md" | "lg";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: TagSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRemove?: () => void;
  removeAriaLabel?: string;
  dot?: boolean;
  clickable?: boolean;
  children?: ReactNode;
}

const variantStyles: Record<TagVariant, { badge: string; dot: string }> = {
  primary: {
    badge: "bg-primary/10 text-primary border border-primary/20",
    dot: "bg-primary",
  },
  teal: {
    badge: "bg-teal/10 text-teal border border-teal/20",
    dot: "bg-teal",
  },
  neutral: {
    badge: "bg-gray-100 text-text border border-border",
    dot: "bg-gray-400",
  },
  success: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  warning: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  danger: {
    badge: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
  outline: {
    badge: "bg-transparent text-text border border-border",
    dot: "bg-text/50",
  },
};

const sizeStyles: Record<TagSize, { tag: string; icon: string; dot: string; close: string }> = {
  sm: {
    tag: "h-5 text-[11px] px-2 gap-1 rounded-sm",
    icon: "w-3 h-3",
    dot: "w-1.5 h-1.5",
    close: "w-3 h-3 p-0.5",
  },
  md: {
    tag: "h-6 text-xs px-2.5 gap-1.5 rounded-md",
    icon: "w-3.5 h-3.5",
    dot: "w-1.5 h-1.5",
    close: "w-3.5 h-3.5 p-0.5",
  },
  lg: {
    tag: "h-7 text-sm px-3 gap-2 rounded-md",
    icon: "w-4 h-4",
    dot: "w-2 h-2",
    close: "w-4 h-4 p-0.5",
  },
};

export function Tag({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  onRemove,
  removeAriaLabel = "Remove tag",
  dot = false,
  clickable = false,
  className,
  children,
  onClick,
  ...restProps
}: TagProps): JSX.Element {
  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];
  const isInteractive = clickable || Boolean(onClick);

  const handleRemove = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium font-inter select-none transition-all duration-150 shrink-0",
        currentVariant.badge,
        currentSize.tag,
        isInteractive && "cursor-pointer hover:opacity-80 active:scale-95",
        className,
      )}
      onClick={onClick}
      {...restProps}
    >
      {dot && (
        <span
          className={cn("rounded-full shrink-0", currentVariant.dot, currentSize.dot)}
          aria-hidden="true"
        />
      )}

      {leftIcon && (
        <span className={cn("inline-flex items-center justify-center shrink-0", currentSize.icon)}>
          {leftIcon}
        </span>
      )}

      {children && <span>{children}</span>}

      {rightIcon && !onRemove && (
        <span className={cn("inline-flex items-center justify-center shrink-0", currentSize.icon)}>
          {rightIcon}
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          aria-label={removeAriaLabel}
          className={cn(
            "inline-flex items-center justify-center rounded-full hover:bg-black/10 transition-colors cursor-pointer",
            currentSize.close,
          )}
        >
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
