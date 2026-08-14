import type { HTMLAttributes, CSSProperties, JSX } from "react";
import { cn } from "@/lib/utils/cn";

export type SkeletonVariant = "text" | "circular" | "rectangular" | "rounded";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
  animate?: boolean;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: "h-4 w-full rounded-sm",
  circular: "rounded-full shrink-0",
  rectangular: "rounded-none w-full",
  rounded: "rounded-md w-full",
};

export function Skeleton({
  variant = "text",
  width,
  height,
  count = 1,
  animate = true,
  className,
  style,
  ...restProps
}: SkeletonProps): JSX.Element {
  const customStyles: CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    ...style,
  };

  const skeletonElement = (index: number = 0): JSX.Element => (
    <div
      key={index}
      role="status"
      aria-label="Loading..."
      style={customStyles}
      className={cn(
        "bg-border/60 transition-colors",
        animate && "animate-pulse",
        variantStyles[variant],
        className,
      )}
      {...restProps}
    />
  );

  if (count > 1) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {Array.from({ length: count }).map((_, idx) => skeletonElement(idx))}
      </div>
    );
  }

  return skeletonElement();
}
