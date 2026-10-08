import { useState, useEffect, type JSX } from "react";
import {
  FiExternalLink,
  FiDownload,
  FiArrowUp,
  FiArrowDown,
  FiBookmark,
  FiFile,
  FiLayers,
  FiCalendar,
  FiX,
} from "react-icons/fi";
import { Modal, Button, Avatar, Skeleton } from "@/components/common";
import {
  getResourceById,
  downloadResource,
  voteResource,
  saveResource,
} from "../api/resources.api";
import { ResourceLinkPreviewCard } from "./ResourceLinkPreviewCard";
import {
  isPartAFile,
  type ResourceDetail,
  type ResourcePart,
} from "@/types/resources.types";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils/cn";

export interface ResourceDetailModalProps {
  resourceId: string | null;
  open: boolean;
  onClose: () => void;
  onVoteChange?: (resourceId: string, isUpvoted: boolean, newCount: number) => void;
  onSaveChange?: (resourceId: string, isSaved: boolean) => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourceDetailModal({
  resourceId,
  open,
  onClose,
  onVoteChange,
  onSaveChange,
}: ResourceDetailModalProps): JSX.Element | null {
  const [detail, setDetail] = useState<ResourceDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadingPartId, setDownloadingPartId] = useState<string | null>(null);

  const [prevId, setPrevId] = useState<string | null>(null);
  if (open && resourceId && resourceId !== prevId) {
    setPrevId(resourceId);
    setDetail(null);
    setIsLoading(true);
  } else if (!open && prevId !== null) {
    setPrevId(null);
    setDetail(null);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!open || !resourceId) {
      return;
    }

    let isMounted = true;

    async function fetchDetail(): Promise<void> {
      try {
        const response = await getResourceById(resourceId as string);
        if (isMounted) {
          setDetail(response.data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          toast.error(getApiErrorMessage(err, "Failed to load resource details"));
          onClose();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [open, resourceId, onClose]);

  const handleVoteToggle = async (): Promise<void> => {
    if (!detail) return;
    const wasUpvoted = Boolean(detail.isUpvotedByMe) && detail.upvoteCount > 0;
    const wasDownvoted = Boolean(detail.isDownvotedByMe);
    const previousVote: -1 | 0 | 1 = wasUpvoted ? 1 : wasDownvoted ? -1 : 0;

    const nextVote: -1 | 0 | 1 = wasUpvoted ? 0 : 1;
    const voteDelta = wasUpvoted ? -1 : 1;
    const nextCount = Math.max(0, detail.upvoteCount + voteDelta);

    // Optimistic update
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            isUpvotedByMe: nextVote === 1,
            isDownvotedByMe: false,
            upvoteCount: nextCount,
          }
        : null,
    );

    try {
      const res = await voteResource(detail.id, nextVote, previousVote);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              isUpvotedByMe: res.data.isUpvoted,
              isDownvotedByMe: res.data.isDownvoted ?? false,
              upvoteCount: res.data.upvoteCount,
              downvoteCount: res.data.downvoteCount,
            }
          : null,
      );
      onVoteChange?.(detail.id, res.data.isUpvoted, res.data.upvoteCount);
    } catch (err: unknown) {
      // Rollback
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              isUpvotedByMe: detail.isUpvotedByMe,
              isDownvotedByMe: detail.isDownvotedByMe,
              upvoteCount: detail.upvoteCount,
            }
          : null,
      );
      toast.error(getApiErrorMessage(err, "Failed to record vote"));
    }
  };

  const handleDownvoteToggle = async (): Promise<void> => {
    if (!detail) return;
    const wasUpvoted = Boolean(detail.isUpvotedByMe) && detail.upvoteCount > 0;
    const wasDownvoted = Boolean(detail.isDownvotedByMe);
    const previousVote: -1 | 0 | 1 = wasUpvoted ? 1 : wasDownvoted ? -1 : 0;

    const nextVote: -1 | 0 | 1 = wasDownvoted ? 0 : -1;
    const upvoteDelta = wasUpvoted ? -1 : 0;
    const nextCount = Math.max(0, detail.upvoteCount + upvoteDelta);

    // Optimistic update
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            isUpvotedByMe: false,
            isDownvotedByMe: nextVote === -1,
            upvoteCount: nextCount,
          }
        : null,
    );

    try {
      const res = await voteResource(detail.id, nextVote, previousVote);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              isUpvotedByMe: res.data.isUpvoted,
              isDownvotedByMe: res.data.isDownvoted ?? (nextVote === -1),
              upvoteCount: res.data.upvoteCount,
              downvoteCount: res.data.downvoteCount,
            }
          : null,
      );
    } catch (err: unknown) {
      // Rollback
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              isUpvotedByMe: detail.isUpvotedByMe,
              isDownvotedByMe: detail.isDownvotedByMe,
              upvoteCount: detail.upvoteCount,
            }
          : null,
      );
      toast.error(getApiErrorMessage(err, "Failed to record downvote"));
    }
  };

  const handleSaveToggle = async (): Promise<void> => {
    if (!detail) return;
    const nextSaveState = !detail.isSavedByMe;

    // Optimistic update
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            isSavedByMe: nextSaveState,
            saveCount: Math.max(0, prev.saveCount + (nextSaveState ? 1 : -1)),
          }
        : null,
    );

    try {
      await saveResource(detail.id, nextSaveState);
      onSaveChange?.(detail.id, nextSaveState);
      toast.success(nextSaveState ? "Resource saved to library" : "Resource removed from library");
    } catch (err: unknown) {
      // Rollback
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              isSavedByMe: !nextSaveState,
              saveCount: detail.saveCount,
            }
          : null,
      );
      toast.error(getApiErrorMessage(err, "Failed to update save status"));
    }
  };

  const handleDownload = async (partId?: string): Promise<void> => {
    if (!detail) return;

    if (partId) {
      setDownloadingPartId(partId);
    } else {
      setIsDownloading(true);
    }

    try {
      const res = await downloadResource(detail.id, partId);
      if (res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, "_blank", "noopener,noreferrer");
        toast.success(`Download started: ${res.data.fileName || "File"}`);
      } else {
        toast.error("Download URL not provided by server");
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to initialize download"));
    } finally {
      if (partId) {
        setDownloadingPartId(null);
      } else {
        setIsDownloading(false);
      }
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
      className="p-0 overflow-hidden bg-white rounded-2xl border border-border shadow-2xl"
    >
      <div className="flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2">
            {detail?.category && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {detail.category}
              </span>
            )}
            {detail?.createdAt && (
              <span className="flex items-center gap-1 text-xs text-text/50">
                <FiCalendar className="w-3.5 h-3.5" />
                <span>{formatDate(detail.createdAt)}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text/40 hover:text-text hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 slim-scrollbar">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 rounded-lg" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : detail ? (
            <>
              {/* Title & Cover */}
              <div className="space-y-4">
                {detail.logoUrl && (
                  <div className="w-full max-h-48 rounded-xl overflow-hidden border border-border bg-slate-100 flex items-center justify-center">
                    <img
                      src={detail.logoUrl}
                      alt={detail.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <h1 className="text-xl sm:text-2xl font-bold text-text leading-snug">
                  {detail.title}
                </h1>

                {/* Author info */}
                <div className="flex items-center gap-3 py-1">
                  <Avatar
                    name={detail.uploader?.name || detail.uploader?.username || "Author"}
                    src={detail.uploader?.avatarUrl || undefined}
                    size="sm"
                    className="ring-1 ring-border"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-text">
                      {detail.uploader?.name || detail.uploader?.username || "Community Member"}
                    </p>
                    <p className="text-[11px] text-text/50">
                      @{detail.uploader?.username || "devspace"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none text-text/80 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-border/60">
                {detail.description}
              </div>

              {/* Primary Attachment or External Link */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text/50">
                  Resource Access
                </h3>

                {detail.externalUrl ? (
                  <ResourceLinkPreviewCard
                    url={detail.externalUrl}
                    fallbackTitle={detail.title}
                    fallbackDescription={detail.description}
                  />
                ) : detail.fileDetails ? (
                  <div className="p-4 rounded-xl border border-border bg-white flex items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FiFile className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text truncate">
                          {detail.fileDetails.fileName}
                        </p>
                        <p className="text-[11px] text-text/50 mt-0.5">
                          {formatFileSize(detail.fileDetails.fileSizeBytes)} •{" "}
                          {detail.fileDetails.format.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<FiDownload className="w-3.5 h-3.5" />}
                      onClick={() => void handleDownload()}
                      isLoading={isDownloading}
                      className="shrink-0 text-xs font-semibold"
                    >
                      Download
                    </Button>
                  </div>
                ) : null}
              </div>

              {/* Sub-parts / Chapters */}
              {detail.parts && detail.parts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text/50 flex items-center gap-1.5">
                      <FiLayers className="w-3.5 h-3.5" />
                      <span>Chapters & Modules ({detail.parts.length})</span>
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {detail.parts.map((part: ResourcePart) => {
                      const isFile = isPartAFile(part);
                      const visitUrl = part.contentUrl || part.downloadUrl || "#";

                      return (
                        <div
                          key={part.partId}
                          className="p-3.5 rounded-xl border border-border bg-white flex items-center justify-between gap-3 shadow-2xs hover:border-border/90 transition-all"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-text truncate">
                              {part.sequenceOrder}. {part.title}
                            </p>
                            {part.description && (
                              <p className="text-[11px] text-text/60 truncate mt-0.5">
                                {part.description}
                              </p>
                            )}
                          </div>

                          {isFile ? (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<FiDownload className="w-3.5 h-3.5" />}
                              onClick={() => void handleDownload(part.partId)}
                              isLoading={downloadingPartId === part.partId}
                              className="shrink-0 text-xs font-semibold"
                            >
                              Download
                            </Button>
                          ) : (
                            <a
                              href={visitUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:text-primary hover:border-primary/50 hover:bg-slate-50 transition-all shrink-0 shadow-2xs"
                            >
                              <span>Visit Link</span>
                              <FiExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags */}
              {detail.tags && detail.tags.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text/50">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.tags.map((tag) => (
                      <span
                        key={tag.name}
                        className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-text/70 rounded-md border border-border/40"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-sm text-text/50">Resource not found</div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-lg border border-border bg-white shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={() => void handleVoteToggle()}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all",
                  detail?.isUpvotedByMe && (detail.upvoteCount ?? 0) > 0
                    ? "bg-primary text-white"
                    : "bg-white text-text/80 hover:text-primary hover:bg-slate-50",
                )}
                aria-label={`Upvote (${detail?.upvoteCount ?? 0})`}
              >
                <FiArrowUp className="w-3.5 h-3.5" />
                <span>Upvote ({detail?.upvoteCount ?? 0})</span>
              </button>

              <div className="w-px h-4 bg-border/80" />

              <button
                type="button"
                onClick={() => void handleDownvoteToggle()}
                className={cn(
                  "inline-flex items-center px-2 py-1.5 text-xs font-semibold transition-all",
                  detail?.isDownvotedByMe
                    ? "bg-rose-600 text-white"
                    : "bg-white text-text/50 hover:text-rose-600 hover:bg-slate-50",
                )}
                aria-label="Downvote"
              >
                <FiArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleSaveToggle()}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-2xs",
                detail?.isSavedByMe
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-white border-border text-text/70 hover:text-text hover:bg-slate-50",
              )}
            >
              <FiBookmark className={cn("w-3.5 h-3.5", detail?.isSavedByMe && "fill-primary")} />
              <span>{detail?.isSavedByMe ? "Saved" : "Save"}</span>
            </button>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
