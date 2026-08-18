import {
  type HTMLAttributes,
  type ReactNode,
  type ElementType,
  type KeyboardEvent,
  type JSX,
} from "react";
import { cn } from "@/lib/utils/cn";
import { Skeleton } from "./Skeleton";

export type CardVariant = "default" | "elevated" | "outlined" | "interactive" | "gradient";
export type CardPadding = "none" | "sm" | "md" | "lg";

// ---------------------------------------------------------
// Root Card Component
// ---------------------------------------------------------
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  clickable?: boolean;
  as?: ElementType;
  children?: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white border border-border shadow-2xs",
  elevated: "bg-white border border-border shadow-md",
  outlined: "bg-transparent border border-border/90",
  interactive:
    "bg-white border border-border shadow-2xs hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:translate-y-0 active:shadow-xs",
  gradient:
    "bg-gradient-to-br from-white via-background to-primary/5 border border-primary/20 shadow-xs",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({
  variant = "default",
  padding = "md",
  hoverable = false,
  clickable = false,
  as: Component = "div",
  className,
  children,
  onClick,
  onKeyDown,
  ...restProps
}: CardProps): JSX.Element {
  const isInteractive = clickable || variant === "interactive" || Boolean(onClick);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (isInteractive && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
    onKeyDown?.(e);
  };

  return (
    <Component
      tabIndex={isInteractive ? 0 : undefined}
      role={isInteractive ? "button" : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "rounded-lg font-inter text-text transition-all duration-200 ease-out overflow-hidden flex flex-col",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        hoverable && !isInteractive && "hover:border-border/80 hover:shadow-xs",
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
      {...restProps}
    >
      {children}
    </Component>
  );
}

// ---------------------------------------------------------
// CardHeader Component
// ---------------------------------------------------------
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  avatar?: ReactNode;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function CardHeader({
  avatar,
  action,
  className,
  children,
  ...restProps
}: CardHeaderProps): JSX.Element {
  return (
    <div className={cn("flex items-start justify-between gap-4 pb-3", className)} {...restProps}>
      {avatar ? (
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">{avatar}</div>
          <div className="space-y-0.5 min-w-0">{children}</div>
        </div>
      ) : (
        <div className="space-y-1 min-w-0 flex-1">{children}</div>
      )}

      {action && <div className="shrink-0 flex items-center gap-1.5">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------
// CardTitle Component
// ---------------------------------------------------------
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span";
  className?: string;
  children?: ReactNode;
}

export function CardTitle({
  as: Component = "h3",
  className,
  children,
  ...restProps
}: CardTitleProps): JSX.Element {
  return (
    <Component
      className={cn(
        "text-base sm:text-lg font-bold text-text tracking-tight leading-snug",
        className,
      )}
      {...restProps}
    >
      {children}
    </Component>
  );
}

// ---------------------------------------------------------
// CardDescription Component
// ---------------------------------------------------------
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children?: ReactNode;
}

export function CardDescription({
  className,
  children,
  ...restProps
}: CardDescriptionProps): JSX.Element {
  return (
    <p className={cn("text-xs text-text/60 leading-relaxed", className)} {...restProps}>
      {children}
    </p>
  );
}

// ---------------------------------------------------------
// CardContent Component
// ---------------------------------------------------------
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

export function CardContent({ className, children, ...restProps }: CardContentProps): JSX.Element {
  return (
    <div
      className={cn("text-sm text-text/80 leading-relaxed flex-1 space-y-2", className)}
      {...restProps}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------
// CardFooter Component
// ---------------------------------------------------------
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
  className?: string;
  children?: ReactNode;
}

export function CardFooter({
  bordered = false,
  className,
  children,
  ...restProps
}: CardFooterProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 pt-3 mt-auto text-xs text-text/60",
        bordered && "border-t border-border mt-3",
        className,
      )}
      {...restProps}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------
// CardMedia / Cover Component
// ---------------------------------------------------------
export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  aspectRatio?: "video" | "square" | "wide" | "auto";
  badge?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const aspectStyles = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[21/9]",
  auto: "h-44 w-full",
};

export function CardMedia({
  src,
  alt = "Card cover",
  aspectRatio = "video",
  badge,
  className,
  children,
  ...restProps
}: CardMediaProps): JSX.Element {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-border/40 -mx-4 -mt-4 mb-4 sm:-mx-6 sm:-mt-6 sm:mb-4 shrink-0",
        aspectStyles[aspectRatio],
        className,
      )}
      {...restProps}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        children
      )}

      {badge && <div className="absolute top-3 left-3 z-10">{badge}</div>}
    </div>
  );
}

// ---------------------------------------------------------
// CardSkeleton Component (Matching Placeholder)
// ---------------------------------------------------------
export interface CardSkeletonProps {
  hasCover?: boolean;
  hasAvatar?: boolean;
  lines?: number;
  className?: string;
}

export function CardSkeleton({
  hasCover = false,
  hasAvatar = true,
  lines = 2,
  className,
}: CardSkeletonProps): JSX.Element {
  return (
    <div
      role="status"
      aria-label="Loading card content..."
      className={cn(
        "bg-white border border-border rounded-lg p-5 space-y-4 shadow-2xs font-inter w-full",
        className,
      )}
    >
      {hasCover && (
        <Skeleton variant="rectangular" height={140} className="rounded-md w-full mb-3" />
      )}

      {hasAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={36} height={36} />
          <div className="space-y-1.5 flex-1">
            <Skeleton width="40%" height={12} />
            <Skeleton width="25%" height={10} />
          </div>
        </div>
      )}

      <Skeleton width="85%" height={18} />
      <Skeleton count={lines} />

      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Skeleton width={50} height={20} className="rounded-md" />
          <Skeleton width={60} height={20} className="rounded-md" />
        </div>
        <Skeleton width={60} height={14} />
      </div>
    </div>
  );
}
