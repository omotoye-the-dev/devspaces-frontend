import { useState, useEffect, useCallback, type JSX } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiExternalLink,
  FiDownload,
  FiArrowUp,
  FiArrowDown,
  FiBookmark,
  FiFile,
  FiLayers,
  FiCalendar,
  FiShare2,
  FiCheck,
  FiFolder,
  FiEye,
  FiEyeOff,
  FiEdit3,
} from "react-icons/fi";
import { Avatar, Button, Skeleton } from "@/components/common";
import {
  getResourceById,
  downloadResource,
  voteResource,
  saveResource,
} from "@/features/resources/api/resources.api";
import { ResourceLinkPreviewCard } from "@/features/resources/components/ResourceLinkPreviewCard";
import {
  isPartAFile,
  type ResourceDetail,
  type ResourcePart,
  type LinkPreviewResponseData,
} from "@/types/resources.types";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils/cn";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
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

export function ResourceDetailsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadingPartId, setDownloadingPartId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [ogCoverImage, setOgCoverImage] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<boolean>(false);
  const [expandedPartPreviewId, setExpandedPartPreviewId] = useState<string | null>(null);

  const handlePreviewLoaded = useCallback(
    (preview: LinkPreviewResponseData): void => {
      if (!resource?.logoUrl && preview.imageUrl) {
        setOgCoverImage(preview.imageUrl);
      }
    },
    [resource?.logoUrl],
  );

  const [prevId, setPrevId] = useState<string | undefined>(id);
  if (id !== prevId) {
    setPrevId(id);
    setIsLoading(true);
    setError(null);
    setBannerError(false);
  }

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadResource(): Promise<void> {
      try {
        const res = await getResourceById(id as string);
        if (isMounted) {
          setResource(res.data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(getApiErrorMessage(err, "Failed to load resource details."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadResource();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleVoteToggle = async (): Promise<void> => {
    if (!resource) return;

    const wasUpvoted = Boolean(resource.isUpvotedByMe) && resource.upvoteCount > 0;
    const wasDownvoted = Boolean(resource.isDownvotedByMe);
    const previousVote: -1 | 0 | 1 = wasUpvoted ? 1 : wasDownvoted ? -1 : 0;

    const nextVote: -1 | 0 | 1 = wasUpvoted ? 0 : 1;
    const delta = wasUpvoted ? -1 : 1;
    const nextCount = Math.max(0, resource.upvoteCount + delta);

    // Optimistic update
    setResource((prev) =>
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
      const res = await voteResource(resource.id, nextVote, previousVote);
      setResource((prev) =>
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
    } catch (err: unknown) {
      // Rollback
      setResource((prev) =>
        prev
          ? {
              ...prev,
              isUpvotedByMe: resource.isUpvotedByMe,
              isDownvotedByMe: resource.isDownvotedByMe,
              upvoteCount: resource.upvoteCount,
            }
          : null,
      );
      toast.error(getApiErrorMessage(err, "Failed to record vote"));
    }
  };

  const handleDownvoteToggle = async (): Promise<void> => {
    if (!resource) return;

    const wasUpvoted = Boolean(resource.isUpvotedByMe) && resource.upvoteCount > 0;
    const wasDownvoted = Boolean(resource.isDownvotedByMe);
    const previousVote: -1 | 0 | 1 = wasUpvoted ? 1 : wasDownvoted ? -1 : 0;

    const nextVote: -1 | 0 | 1 = wasDownvoted ? 0 : -1;
    const upvoteDelta = wasUpvoted ? -1 : 0;
    const nextCount = Math.max(0, resource.upvoteCount + upvoteDelta);

    // Optimistic update
    setResource((prev) =>
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
      const res = await voteResource(resource.id, nextVote, previousVote);
      setResource((prev) =>
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
      setResource((prev) =>
        prev
          ? {
              ...prev,
              isUpvotedByMe: resource.isUpvotedByMe,
              isDownvotedByMe: resource.isDownvotedByMe,
              upvoteCount: resource.upvoteCount,
            }
          : null,
      );
      toast.error(getApiErrorMessage(err, "Failed to record downvote"));
    }
  };

  const handleSaveToggle = async (): Promise<void> => {
    if (!resource) return;
    const nextSaved = !resource.isSavedByMe;

    setResource((prev) =>
      prev
        ? {
            ...prev,
            isSavedByMe: nextSaved,
            saveCount: Math.max(0, prev.saveCount + (nextSaved ? 1 : -1)),
          }
        : null,
    );

    try {
      await saveResource(resource.id, nextSaved);
      toast.success(nextSaved ? "Resource saved to library" : "Removed from library");
    } catch (err: unknown) {
      setResource((prev) =>
        prev
          ? {
              ...prev,
              isSavedByMe: !nextSaved,
              saveCount: resource.saveCount,
            }
          : null,
      );
      toast.error(getApiErrorMessage(err, "Failed to update save status"));
    }
  };

  const handleDownload = async (partId?: string): Promise<void> => {
    if (!resource) return;

    if (partId) {
      setDownloadingPartId(partId);
    } else {
      setIsDownloading(true);
    }

    try {
      const res = await downloadResource(resource.id, partId);
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

  const handleShare = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Could not copy link to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <Skeleton className="h-5 w-40 rounded" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <FiFolder className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-text">Resource Not Found</h1>
        <p className="text-xs sm:text-sm text-text/60">
          {error || "The resource you are looking for does not exist or has been removed."}
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/resources")}
          leftIcon={<FiArrowLeft className="w-4 h-4" />}
          className="mt-2"
        >
          Back to Resources
        </Button>
      </div>
    );
  }

  const isOwner =
    Boolean(currentUser?.id) &&
    (currentUser?.id === resource.uploader?.userId);

  return (
    <div className="min-h-full bg-background overflow-y-auto">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-text/60 hover:text-primary transition-colors group truncate"
          >
            <FiArrowLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span className="truncate">Back to Resource Library</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-semibold text-text/70 hover:text-text hover:bg-slate-50 transition-all shadow-2xs shrink-0"
          >
            {isCopied ? (
              <>
                <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <FiShare2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Header Hero Section */}
        <header className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {resource.category}
            </span>

            <span className="flex items-center gap-1.5 text-xs text-text/50">
              <FiCalendar className="w-3.5 h-3.5" />
              <span>Published {formatDate(resource.createdAt)}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-text tracking-tight leading-tight">
            {resource.title}
          </h1>

          {/* Author Details row */}
          <div className="flex items-center gap-3 pt-1">
            <Avatar
              name={resource.uploader?.name || resource.uploader?.username || "Author"}
              src={resource.uploader?.avatarUrl || undefined}
              size="md"
              className="ring-2 ring-border shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-text truncate">
                {resource.uploader?.name || resource.uploader?.username || "DevSpace Contributor"}
              </p>
              <p className="text-xs text-text/50 truncate">
                @{resource.uploader?.username || "devspace"}
                {isOwner && " • (You)"}
              </p>
            </div>
          </div>
        </header>

        {/* Action Bar (Upvote, Downvote, Save, Direct Resource Link, Edit) */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Unified Voting Control */}
            <div className="inline-flex items-center rounded-xl border border-border bg-white shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={() => void handleVoteToggle()}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold transition-all",
                  resource.isUpvotedByMe && resource.upvoteCount > 0
                    ? "bg-primary text-white"
                    : "bg-white text-text hover:text-primary hover:bg-slate-50",
                )}
                aria-label={`Upvote (${resource.upvoteCount})`}
              >
                <FiArrowUp className="w-4 h-4" />
                <span>Upvote</span>
                {resource.upvoteCount > 0 && <span>({resource.upvoteCount})</span>}
              </button>

              <div className="w-px h-5 bg-border/80" />

              <button
                type="button"
                onClick={() => void handleDownvoteToggle()}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-bold transition-all",
                  resource.isDownvotedByMe
                    ? "bg-rose-600 text-white"
                    : "bg-white text-text/50 hover:text-rose-600 hover:bg-slate-50",
                )}
                aria-label={`Downvote (${resource.downvoteCount ?? 0})`}
              >
                <FiArrowDown className="w-4 h-4" />
                {(resource.downvoteCount ?? 0) > 0 && (
                  <span>({resource.downvoteCount})</span>
                )}
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

        {/* Two-Column Grid: Content & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content (Left Col, Span 2) */}
          <main className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Banner / Cover Image */}
            {!bannerError && (resource.logoUrl || ogCoverImage) && (
              <div className="w-full rounded-2xl overflow-hidden border border-border bg-slate-100 max-h-80 shadow-2xs">
                <img
                  src={resource.logoUrl || (ogCoverImage ?? undefined)}
                  alt={resource.title}
                  onError={() => setBannerError(true)}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Overview / Description Card */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-border space-y-3 shadow-2xs">
              <h2 className="text-base font-bold text-text">Overview & Description</h2>
              <div className="prose prose-sm max-w-none text-text/80 leading-relaxed whitespace-pre-wrap">
                {resource.description}
              </div>
            </div>

            {/* Attached File or External Link Preview Card */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-border space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-text">Access Material</h2>
                {resource.externalUrl && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    Live Link Preview
                  </span>
                )}
              </div>

              {resource.externalUrl ? (
                <ResourceLinkPreviewCard
                  url={resource.externalUrl}
                  fallbackTitle={resource.title}
                  fallbackDescription={resource.description}
                  onPreviewLoaded={handlePreviewLoaded}
                />
              ) : resource.fileDetails ? (
                <div className="p-4 rounded-xl border border-border bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FiFile className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text truncate">
                        {resource.fileDetails.fileName}
                      </p>
                      <p className="text-xs text-text/50 mt-0.5">
                        {formatFileSize(resource.fileDetails.fileSizeBytes)} •{" "}
                        {resource.fileDetails.format.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<FiDownload className="w-3.5 h-3.5" />}
                    onClick={() => void handleDownload()}
                    isLoading={isDownloading}
                    className="text-xs font-semibold shrink-0"
                  >
                    Download
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-text/50">No primary file attached.</p>
              )}
            </div>

            {/* Chapters / Sub-Parts (Modules) */}
            {resource.parts && resource.parts.length > 0 && (
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-border space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiLayers className="w-5 h-5 text-primary" />
                    <h2 className="text-base font-bold text-text">
                      Chapters & Modules ({resource.parts.length})
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {resource.parts.map((part: ResourcePart) => {
                    const isPreviewOpen = expandedPartPreviewId === part.partId;
                    const isFile = isPartAFile(part);
                    const visitUrl = part.contentUrl || part.downloadUrl || "#";

                    return (
                      <div
                        key={part.partId}
                        className="p-3.5 sm:p-4 rounded-xl border border-border bg-slate-50/40 hover:bg-white space-y-3 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {part.sequenceOrder}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-text truncate">{part.title}</p>
                              {part.description && (
                                <p className="text-xs text-text/60 mt-0.5 leading-relaxed">
                                  {part.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 self-end sm:self-center flex items-center gap-2">
                            {isFile ? (
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<FiDownload className="w-3.5 h-3.5" />}
                                onClick={() => void handleDownload(part.partId)}
                                isLoading={downloadingPartId === part.partId}
                                className="text-xs font-semibold"
                              >
                                Download
                              </Button>
                            ) : (
                              <>
                                {part.contentUrl && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedPartPreviewId((prev) =>
                                        prev === part.partId ? null : part.partId,
                                      )
                                    }
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                                      isPreviewOpen
                                        ? "bg-primary/10 text-primary border-primary/30"
                                        : "border-border bg-white text-text/70 hover:text-text hover:bg-slate-50 shadow-2xs",
                                    )}
                                    title="Toggle Link Preview"
                                  >
                                    {isPreviewOpen ? (
                                      <>
                                        <FiEyeOff className="w-3.5 h-3.5" />
                                        <span>Hide Preview</span>
                                      </>
                                    ) : (
                                      <>
                                        <FiEye className="w-3.5 h-3.5" />
                                        <span>Preview</span>
                                      </>
                                    )}
                                  </button>
                                )}
                                <a
                                  href={visitUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-white text-xs font-semibold text-text hover:text-primary hover:border-primary/50 hover:bg-slate-50 transition-all shadow-2xs"
                                >
                                  <span>Visit Link</span>
                                  <FiExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Expandable Module Link Preview */}
                        {part.contentUrl && isPreviewOpen && (
                          <div className="pt-2 border-t border-border/60">
                            <ResourceLinkPreviewCard
                              url={part.contentUrl}
                              fallbackTitle={part.title}
                              fallbackDescription={part.description || undefined}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tags Section */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-border space-y-3 shadow-2xs">
                <h2 className="text-sm font-bold text-text">Tags & Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-text/70 border border-border/50"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar: Author & Stats */}
          <aside className="space-y-6">
            {/* Author Profile Card */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-border space-y-4 shadow-2xs text-center">
              <Avatar
                name={resource.uploader?.name || resource.uploader?.username || "Author"}
                src={resource.uploader?.avatarUrl || undefined}
                size="lg"
                className="mx-auto ring-4 ring-primary/10"
              />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-text">
                  {resource.uploader?.name || resource.uploader?.username || "Contributor"}
                </h3>
                <p className="text-xs text-text/50">
                  @{resource.uploader?.username || "devspace"}
                </p>
              </div>

              {resource.uploader?.userId && (
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/profile/${resource.uploader.userId}`)}
                  className="text-xs font-semibold"
                >
                  View Profile
                </Button>
              )}
            </div>

            {/* Resource Engagement Stats Card */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-border space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-text">Resource Statistics</h3>
              <div className="divide-y divide-border text-xs">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-text/60">Community Upvotes</span>
                  <span className="font-bold text-text">{resource.upvoteCount}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-text/60">Community Downvotes</span>
                  <span className="font-bold text-text">{resource.downvoteCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-text/60">Total Downloads</span>
                  <span className="font-bold text-text">{resource.downloadCount}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-text/60">Library Saves</span>
                  <span className="font-bold text-text">{resource.saveCount}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-text/60">Modules / Chapters</span>
                  <span className="font-bold text-text">{resource.partsCount || 0}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ResourceDetailsPage;
