import type { JSX } from "react";
import { FiTrash2, FiPlus, FiEdit2, FiExternalLink, FiLayers } from "react-icons/fi";
import { Button, EmptyState } from "@/shared/ui";
import { isPartAFile } from "@/features/resources/types/resources.types";
import { cn } from "@/shared/lib/utils/cn";

import type { UseResourceEditorResult } from "@/features/resources/hooks/useResourceEditor";

/** Chapters / modules list with add, edit and delete. */
export function ResourcePartsSection({ editor }: { editor: UseResourceEditorResult }): JSX.Element {
  const { parts, setPartToDelete, handleOpenAddPartModal, handleOpenEditPartModal } = editor;

  return (
    <>
      <section className="bg-white border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FiLayers className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-text">Sub-Parts & Chapters ({parts.length})</h2>
            </div>
            <p className="text-xs text-text/60 mt-0.5">
              Break this resource into sequential modules, lessons, or downloadable parts.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={<FiPlus className="w-4 h-4" />}
            onClick={handleOpenAddPartModal}
            className="rounded-xl font-semibold shadow-xs"
          >
            Add Sub-Part
          </Button>
        </div>

        {parts.length > 0 ? (
          <div className="space-y-3">
            {parts
              .slice()
              .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
              .map((part, index) => {
                const isFile = isPartAFile(part);
                return (
                  <div
                    key={part.partId || index}
                    className="p-4 rounded-xl border border-border hover:border-primary/40 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {part.sequenceOrder || index + 1}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-text truncate">{part.title}</h4>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider",
                              isFile ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800",
                            )}
                          >
                            {isFile ? "File" : "External Link"}
                          </span>
                        </div>

                        {part.description && (
                          <p className="text-xs text-text/70 line-clamp-2 leading-relaxed">
                            {part.description}
                          </p>
                        )}

                        {part.contentUrl && (
                          <a
                            href={part.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                          >
                            <span className="truncate max-w-xs">{part.contentUrl}</span>
                            <FiExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<FiEdit2 className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEditPartModal(part)}
                        className="text-xs h-8 px-2.5 rounded-lg"
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPartToDelete(part)}
                        className="text-xs h-8 px-2.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                        aria-label={`Delete ${part.title}`}
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <EmptyState
            size="sm"
            icon={<FiLayers className="w-8 h-8 text-text/30" />}
            title="No sub-parts yet"
            description="Add chapters, lessons, or auxiliary guides to make this resource richer."
            bordered
            action={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FiPlus className="w-4 h-4" />}
                onClick={handleOpenAddPartModal}
                className="rounded-xl"
              >
                Add First Sub-Part
              </Button>
            }
          />
        )}
      </section>
    </>
  );
}
