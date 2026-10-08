import type { JSX, MouseEvent } from "react";
import { FiBookmark, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { Avatar } from "@/components/common";
import { cn } from "@/lib/utils/cn";

export interface ResourceAuthor {
  id?: string;
  name: string;
  avatarUrl?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: string; // Text initials (e.g. "TS") or image URL
  iconBgColor?: string; // Optional background color (defaults to blue gradient/primary)
  url?: string;
  tags: string[];
  author: ResourceAuthor;
  updatedAt: string;
  upvotesCount: number;
  downvotesCount?: number;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  isBookmarked?: boolean;
}

export interface ResourceCardProps {
  resource: ResourceItem;
  onUpvote?: (id: string, e: MouseEvent<HTMLButtonElement>) => void;
  onDownvote?: (id: string, e: MouseEvent<HTMLButtonElement>) => void;
  onBookmark?: (id: string, e: MouseEvent<HTMLButtonElement>) => void;
  onClick?: (resource: ResourceItem) => void;
  className?: string;
}

function formatUpvotes(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return count.toString();
}

export function ResourceCard({
  resource,
  onUpvote,
  onDownvote,
  onBookmark,
  onClick,
  className,
}: ResourceCardProps): JSX.Element {
  const {
    id,
    title,
    description,
    category,
    icon,
    iconBgColor,
    tags,
    author,
    updatedAt,
    upvotesCount,
    downvotesCount = 0,
    isUpvoted = false,
    isDownvoted = false,
    isBookmarked = false,
  } = resource;

  const handleCardClick = (): void => {
    onClick?.(resource);
  };

  const handleUpvoteClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onUpvote?.(id, e);
  };

  const handleDownvoteClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onDownvote?.(id, e);
  };

  const handleBookmarkClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onBookmark?.(id, e);
  };

  // Prevent false active upvote indicator when resource has 0 upvotes
  const activeUpvoted = Boolean(isUpvoted) && upvotesCount > 0;
  const activeDownvoted = Boolean(isDownvoted);

  const isImageIcon =
    icon && (icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("/"));

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        "bg-white border border-border rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-border/90 transition-all duration-200 flex flex-col justify-between cursor-pointer group select-none",
        className,
      )}
    >
      {/* Top Body */}
      <div>
        {/* Header row: Icon + Category + Title */}
        <div className="flex items-start gap-3 sm:gap-3.5">
          <div
            className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm sm:text-base shadow-2xs overflow-hidden",
              !iconBgColor && "bg-[#1877F2]",
            )}
            style={iconBgColor ? { backgroundColor: iconBgColor } : undefined}
          >
            {isImageIcon ? (
              <img src={icon} alt={title} className="w-full h-full object-cover" />
            ) : (
              <span>{icon || title.slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs font-semibold text-primary capitalize tracking-wide block">
              {category}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-text group-hover:text-primary transition-colors leading-snug line-clamp-1 mt-0.5">
              {title}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-text/70 leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-medium bg-primary/10 text-primary rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <footer className="mt-4 sm:mt-5 pt-3 border-t border-border/80 flex items-center justify-between gap-2">
        {/* Author details */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <Avatar
            name={author.name}
            src={author.avatarUrl}
            size="sm"
            href={null}
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-text truncate leading-tight">
              {author.name}
            </p>
            <p className="text-[10px] sm:text-[11px] text-text/50 truncate leading-tight mt-0.5">{updatedAt}</p>
          </div>
        </div>

        {/* Actions: Upvote/Downvote Group + Bookmark */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center rounded-lg border border-border bg-white shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={handleUpvoteClick}
              aria-label={`Upvote (${upvotesCount})`}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-xs font-semibold transition-all duration-150",
                activeUpvoted
                  ? "bg-primary text-white"
                  : "bg-white text-text/80 hover:text-primary hover:bg-slate-50",
              )}
            >
              <FiArrowUp className="w-3.5 h-3.5" />
              {upvotesCount > 0 && <span>{formatUpvotes(upvotesCount)}</span>}
            </button>

            <div className="w-px h-3.5 bg-border/80" />

            <button
              type="button"
              onClick={handleDownvoteClick}
              aria-label={`Downvote (${downvotesCount ?? 0})`}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-xs font-semibold transition-all duration-150",
                activeDownvoted
                  ? "bg-rose-600 text-white"
                  : "bg-white text-text/50 hover:text-rose-600 hover:bg-slate-50",
              )}
            >
              <FiArrowDown className="w-3.5 h-3.5" />
              {(downvotesCount ?? 0) > 0 && <span>{formatUpvotes(downvotesCount ?? 0)}</span>}
            </button>
          </div>

          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label="Bookmark resource"
            className={cn(
              "p-1.5 rounded-md transition-colors",
              isBookmarked
                ? "text-primary fill-primary"
                : "text-text/50 hover:text-primary hover:bg-slate-100/60",
            )}
          >
            <FiBookmark className={cn("w-4 h-4", isBookmarked && "fill-primary text-primary")} />
          </button>
        </div>
      </footer>
    </article>
  );
}
