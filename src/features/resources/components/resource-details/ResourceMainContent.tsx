import type { JSX } from "react";
import { FiExternalLink, FiDownload, FiFile, FiLayers, FiEye, FiEyeOff } from "react-icons/fi";
import { Button } from "@/shared/ui";
import { ResourceLinkPreviewCard } from "@/features/resources/components/ResourceLinkPreviewCard";
import {
  isPartAFile,
  type ResourceDetail,
  type ResourcePart,
} from "@/features/resources/types/resources.types";
import { cn } from "@/shared/lib/utils/cn";
import { formatFileSize } from "@/features/resources/utils/resourceFormat";
import type { UseResourceDetailsResult } from "@/features/resources/hooks/useResourceDetails";

/** Cover, overview, file/link preview, chapters and tags. */
export function ResourceMainContent({
  details,
  resource,
}: {
  details: UseResourceDetailsResult;
  resource: ResourceDetail;
}): JSX.Element {
  const {
    isDownloading,
    downloadingPartId,
    ogCoverImage,
    bannerError,
    setBannerError,
    expandedPartPreviewId,
    setExpandedPartPreviewId,
    handlePreviewLoaded,
    handleDownload,
  } = details;

  return (
    <>
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
    </>
  );
}
