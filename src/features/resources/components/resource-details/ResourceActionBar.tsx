import type { JSX } from "react";
import {
  FiExternalLink,
  FiDownload,
  FiArrowUp,
  FiArrowDown,
  FiBookmark,
  FiEdit3,
} from "react-icons/fi";
import { Button } from "@/shared/ui";
import type { ResourceDetail } from "@/features/resources/types/resources.types";
import { cn } from "@/shared/lib/utils/cn";

import type { UseResourceDetailsResult } from "@/features/resources/hooks/useResourceDetails";

/** Upvote, downvote, save, open link and edit actions. */
export function ResourceActionBar({
  details,
  resource,
}: {
  details: UseResourceDetailsResult;
  resource: ResourceDetail;
}): JSX.Element {
  const {
    isDownloading,
    navigate,
    currentUser,
    handleVoteToggle,
    handleDownvoteToggle,
    handleSaveToggle,
    handleDownload,
  } = details;

  return (
    <>
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Unified Voting Control */}
          <div className="inline-flex items-center rounded-xl border border-border bg-white shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => void handleVoteToggle()}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold transition-all",
                resource.isUpvotedByMe
                  ? "bg-primary text-white"
                  : "bg-white text-text hover:text-primary hover:bg-slate-50",
              )}
              aria-label={`Upvote (${resource.upvoteCount ?? 0})`}
              title={resource.isDownvotedByMe ? "Remove downvote first before upvoting" : undefined}
            >
              <FiArrowUp className="w-4 h-4" />
              <span>Upvote ({resource.upvoteCount ?? 0})</span>
            </button>

            <div className="w-px h-5 bg-border/80" />

            <button
              type="button"
              onClick={() => void handleDownvoteToggle()}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold transition-all",
                resource.isDownvotedByMe
                  ? "bg-rose-600 text-white"
                  : "bg-white text-text/50 hover:text-rose-600 hover:bg-slate-50",
              )}
              aria-label={`Downvote (${resource.downvoteCount ?? 0})`}
              title={resource.isUpvotedByMe ? "Remove upvote first before downvoting" : undefined}
            >
              <FiArrowDown className="w-4 h-4" />
              <span>Downvote ({resource.downvoteCount ?? 0})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => void handleSaveToggle()}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-2xs",
              resource.isSavedByMe
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-white border-border text-text/70 hover:text-text hover:bg-slate-50",
            )}
          >
            <FiBookmark className={cn("w-4 h-4", resource.isSavedByMe && "fill-primary")} />
            <span>{resource.isSavedByMe ? "Saved" : "Save"}</span>
          </button>
        </div>

        {/* Main Action (Edit if Author, plus Download or External Link) */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {Boolean(
            currentUser &&
            (resource.uploader?.userId === currentUser.id ||
              resource.uploader?.username?.toLowerCase() ===
                (currentUser.username || currentUser.userName)?.toLowerCase()),
          ) && (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<FiEdit3 className="w-4 h-4" />}
              onClick={() => navigate(`/resources/${resource.id}/edit`)}
              className="font-semibold shadow-xs"
            >
              Edit Resource
            </Button>
          )}

          {resource.externalUrl ? (
            <a
              href={resource.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              <span>Visit Resource</span>
              <FiExternalLink className="w-4 h-4" />
            </a>
          ) : resource.fileDetails ? (
            <Button
              variant="primary"
              size="md"
              leftIcon={<FiDownload className="w-4 h-4" />}
              onClick={() => void handleDownload()}
              isLoading={isDownloading}
              className="w-full sm:w-auto font-bold shadow-sm"
            >
              Download Attachment
            </Button>
          ) : null}
        </div>
      </div>
    </>
  );
}
