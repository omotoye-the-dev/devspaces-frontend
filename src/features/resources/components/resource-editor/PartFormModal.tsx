import type { JSX } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, Input, Textarea, Modal } from "@/shared/ui";
import { cn } from "@/shared/lib/utils/cn";

import type { UseResourceEditorResult } from "@/features/resources/hooks/useResourceEditor";

/** Add / edit chapter modal. */
export function PartFormModal({ editor }: { editor: UseResourceEditorResult }): JSX.Element {
  const {
    isPartModalOpen,
    setIsPartModalOpen,
    editingPart,
    partTitle,
    setPartTitle,
    partDescription,
    setPartDescription,
    partAccessType,
    setPartAccessType,
    partContentUrl,
    setPartContentUrl,
    setPartFile,
    partSequence,
    setPartSequence,
    isSavingPart,
    handleSavePart,
  } = editor;

  return (
    <>
      <Modal
        open={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        title={editingPart ? "Edit Sub-Part" : "Add New Sub-Part"}
        size="md"
      >
        <form onSubmit={handleSavePart} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="part-title" className="block text-xs font-semibold text-text">
              Part Title <span className="text-rose-500">*</span>
            </label>
            <Input
              id="part-title"
              value={partTitle}
              onChange={(e) => setPartTitle(e.target.value)}
              placeholder="e.g. Chapter 1: Introduction"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="part-seq" className="block text-xs font-semibold text-text">
                Sequence Order
              </label>
              <Input
                id="part-seq"
                type="number"
                min={1}
                value={partSequence}
                onChange={(e) => setPartSequence(parseInt(e.target.value, 10) || 1)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text">Format</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPartAccessType(1)}
                  className={cn(
                    "py-2 px-2 rounded-lg border text-xs font-semibold transition-all",
                    partAccessType === 1
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-text/60",
                  )}
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => setPartAccessType(0)}
                  className={cn(
                    "py-2 px-2 rounded-lg border text-xs font-semibold transition-all",
                    partAccessType === 0
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-text/60",
                  )}
                >
                  File
                </button>
              </div>
            </div>
          </div>

          {partAccessType === 1 ? (
            <div className="space-y-1.5">
              <label htmlFor="part-url" className="block text-xs font-semibold text-text">
                Content URL
              </label>
              <Input
                id="part-url"
                type="url"
                value={partContentUrl}
                onChange={(e) => setPartContentUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text">Sub-Part Document</label>
              <input
                type="file"
                onChange={(e) => setPartFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-text file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="part-desc" className="block text-xs font-semibold text-text">
              Description (Optional)
            </label>
            <Textarea
              id="part-desc"
              rows={3}
              value={partDescription}
              onChange={(e) => setPartDescription(e.target.value)}
              placeholder="What does this chapter cover?"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsPartModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingPart}
              leftIcon={<FiCheck className="w-4 h-4" />}
            >
              {editingPart ? "Save Part" : "Add Part"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
