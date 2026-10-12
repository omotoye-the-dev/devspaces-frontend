import type { JSX, MouseEvent } from "react";
import {
  HiChevronUp,
  HiChevronDown,
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineShare,
  HiOutlineBookmark,
  HiBookmark,
} from "react-icons/hi2";
import { Avatar, Tag } from "@/components/common";
import { cn } from "@/lib/utils/cn";
import { toast } from "@/hooks/useToast";
import type { Discussion } from "@/types/discussions.types";

export interface DiscussionCardProps {
  discussion: Discussion;
  onOpenDetails: (discussion: Discussion) => void;
  onVote: (discussionId: string, direction: "up" | "down") => void;
  onTagClick?: (tag: string) => void;
  onToggleBookmark?: (discussionId: string) => void;
  className?: string;
}

export function DiscussionCard({
  discussion,
  onOpenDetails,
  onVote,
  onTagClick,
  onToggleBookmark,
  className,
}: DiscussionCardProps): JSX.Element {
  const netVotes = discussion.upvotes - discussion.downvotes;

  const handleVoteClick = (e: MouseEvent<HTMLButtonElement>, direction: "up" | "down"): void => {
    e.stopPropagation();
    onVote(discussion.id, direction);
  };

  const handleShareClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/discussions#${discussion.id}`);
      toast.success("Discussion link copied to clipboard");
    } else {
      toast.success("Discussion link ready");
    }
  };

  const handleBookmarkClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onToggleBookmark?.(discussion.id);
  };

  const handleTagClick = (e: MouseEvent<HTMLSpanElement>, tag: string): void => {
    e.stopPropagation();
    onTagClick?.(tag);
  };

  return (
    <article
      tabIndex={0}
      role="button"
      onClick={() => onOpenDetails(discussion)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetails(discussion);
        }
      }}
      className={cn(
        "group relative flex bg-white border border-border rounded-lg hover:border-primary/40 hover:shadow-xs transition-all duration-150 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer",
        className,
      )}
    >
      {/* Left side: Reddit-style voting sequence column */}
      <div
        className="w-12 sm:w-14 bg-background/50 border-r border-border/70 flex flex-col items-center py-3 shrink-0 select-none gap-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => handleVoteClick(e, "up")}
          aria-label="Upvote question"
          className={cn(
            "p-1.5 rounded-md transition-colors cursor-pointer",
            discussion.userVote === "up"
              ? "text-primary bg-primary/10"
              : "text-text/40 hover:text-primary hover:bg-primary/5",
          )}
        >
          <HiChevronUp className="w-5 h-5 stroke-1" />
        </button>

        <span
          className={cn(
            "text-xs font-bold leading-none py-1 tabular-nums",
            discussion.userVote === "up" && "text-primary",
            discussion.userVote === "down" && "text-rose-500",
            !discussion.userVote && "text-text/70",
          )}
        >
          {netVotes}
        </span>

        <button
          type="button"
          onClick={(e) => handleVoteClick(e, "down")}
          aria-label="Downvote question"
          className={cn(
            "p-1.5 rounded-md transition-colors cursor-pointer",
            discussion.userVote === "down"
              ? "text-rose-500 bg-rose-500/10"
              : "text-text/40 hover:text-rose-500 hover:bg-rose-500/5",
          )}
        >
          <HiChevronDown className="w-5 h-5 stroke-1" />
        </button>
      </div>

      {/* Right side: Discussion details */}
      <div className="flex-1 p-3.5 sm:p-4 min-w-0 flex flex-col justify-between gap-2.5">
        <div>
          {/* Metadata Row */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-text/50 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Avatar
                size="xs"
                name={discussion.author.name}
                src={discussion.author.avatarUrl}
                href={false}
              />
              <span className="font-semibold text-text/80">{discussion.author.name}</span>
              <span className="text-text/40 font-mono">@{discussion.author.username}</span>
            </div>
            <span className="text-text/30">•</span>
            <span>{discussion.createdAt}</span>

            {discussion.isSolved && (
              <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Solved
              </span>
            )}
          </div>

          {/* Question Title */}
          <h2 className="text-base sm:text-lg font-bold text-text group-hover:text-primary transition-colors leading-snug tracking-tight">
            {discussion.title}
          </h2>

          {/* Question Preview Excerpt */}
          <p className="text-sm text-text/65 line-clamp-2 mt-1.5 leading-relaxed">
            {discussion.content}
          </p>

          {/* Tags */}
          {discussion.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {discussion.tags.map((tag) => (
                <Tag
                  key={tag}
                  size="sm"
                  variant="neutral"
                  clickable
                  onClick={(e) => handleTagClick(e, tag)}
                  className="hover:border-primary/40 hover:text-primary transition-colors"
                >
                  #{tag}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-text/60">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(discussion);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-background hover:text-primary transition-colors font-medium cursor-pointer"
            >
              <HiOutlineChatBubbleLeftEllipsis className="w-4 h-4 text-text/50 group-hover:text-primary" />
              <span>
                {discussion.commentsCount} {discussion.commentsCount === 1 ? "comment" : "comments"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleShareClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-background hover:text-text transition-colors font-medium cursor-pointer"
            >
              <HiOutlineShare className="w-4 h-4 text-text/50" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleBookmarkClick}
              aria-label={discussion.isBookmarked ? "Remove bookmark" : "Bookmark discussion"}
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer",
                discussion.isBookmarked
                  ? "text-primary bg-primary/10"
                  : "text-text/40 hover:text-text hover:bg-background",
              )}
            >
              {discussion.isBookmarked ? (
                <HiBookmark className="w-4 h-4" />
              ) : (
                <HiOutlineBookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
