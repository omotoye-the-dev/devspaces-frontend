import { useState, type ReactNode, type JSX } from "react";
import { cn } from "@/lib/utils/cn";
import { Link } from "react-router-dom";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarStatus = "online" | "busy" | "away" | "offline";
export type AvatarShape = "circle" | "rounded" | "square";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  /** Link destination. Defaults to "/profile". Pass null, false, or "" to disable linking. */
  href?: string | null | false;
  status?: AvatarStatus;
  shape?: AvatarShape;
  className?: string;
  fallbackIcon?: ReactNode;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: {
    container: "w-6 h-6",
    text: "text-[10px]",
    status: "w-2 h-2 ring-1",
  },
  sm: {
    container: "w-8 h-8",
    text: "text-xs font-medium",
    status: "w-2.5 h-2.5 ring-1.5",
  },
  md: {
    container: "w-10 h-10",
    text: "text-sm font-semibold",
    status: "w-3 h-3 ring-2",
  },
  lg: {
    container: "w-12 h-12",
    text: "text-base font-semibold",
    status: "w-3.5 h-3.5 ring-2",
  },
  xl: {
    container: "w-16 h-16",
    text: "text-lg font-bold",
    status: "w-4 h-4 ring-2",
  },
  "2xl": {
    container: "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32",
    text: "text-2xl font-bold",
    status: "w-4.5 h-4.5 sm:w-5 sm:h-5 ring-3 ring-white",
  },
};

const shapeStyles: Record<AvatarShape, string> = {
  circle: "rounded-full",
  rounded: "rounded-md",
  square: "rounded-sm",
};

const statusStyles: Record<AvatarStatus, { bg: string; label: string }> = {
  online: { bg: "bg-emerald-500", label: "Online" },
  busy: { bg: "bg-red-500", label: "Do not disturb" },
  away: { bg: "bg-amber-500", label: "Away" },
  offline: { bg: "bg-gray-400", label: "Offline" },
};

function getInitials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  status,
  href = "/profile",
  shape = "circle",
  className,
  fallbackIcon,
}: AvatarProps): JSX.Element {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = sizeStyles[size];
  const initials = getInitials(name);
  const showImage = Boolean(src && !hasError);

  const isLink = Boolean(href);
  const targetHref = typeof href === "string" ? href : "/profile";

  const containerClasses = cn(
    "relative inline-flex items-center justify-center select-none shrink-0 font-inter",
    sizeConfig.container,
    isLink &&
      "transition-opacity hover:opacity-85 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    shapeStyles[shape],
    className,
  );

  const innerContent = (
    <>
      <div
        className={cn(
          "w-full h-full flex items-center justify-center overflow-hidden border border-border/80 bg-primary/10 text-primary shadow-xs",
          shapeStyles[shape],
        )}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt ?? name ?? "Avatar"}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : fallbackIcon ? (
          <div className="flex items-center justify-center text-primary">{fallbackIcon}</div>
        ) : (
          <span className={cn("tracking-wider", sizeConfig.text)}>{initials || "?"}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-white",
            statusStyles[status].bg,
            sizeConfig.status,
          )}
          title={statusStyles[status].label}
          aria-label={statusStyles[status].label}
        />
      )}
    </>
  );

  if (isLink) {
    const isExternal = /^https?:\/\//.test(targetHref);
    if (isExternal) {
      return (
        <a
          href={targetHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={containerClasses}
          aria-label={alt ?? name ?? "Avatar"}
        >
          {innerContent}
        </a>
      );
    }

    return (
      <Link
        to={targetHref}
        onClick={(e) => e.stopPropagation()}
        className={containerClasses}
        aria-label={alt ?? name ?? "Avatar"}
      >
        {innerContent}
      </Link>
    );
  }

  return <div className={containerClasses}>{innerContent}</div>;
}
