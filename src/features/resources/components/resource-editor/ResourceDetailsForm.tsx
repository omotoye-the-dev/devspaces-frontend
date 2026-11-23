import type { JSX } from "react";
import { FiSave, FiUpload, FiExternalLink, FiFile, FiX } from "react-icons/fi";
import { Button, Input, Textarea } from "@/shared/ui";
import { cn } from "@/shared/lib/utils/cn";
import { CATEGORIES } from "@/features/resources/constants/editorCategories";
import type { UseResourceEditorResult } from "@/features/resources/hooks/useResourceEditor";

/** General information form: title, category, access type, URL/file, description, tags. */
export function ResourceDetailsForm({ editor }: { editor: UseResourceEditorResult }): JSX.Element {
  const {
    isSaving,
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    accessType,
    setAccessType,
    externalUrl,
    setExternalUrl,
    tags,
    tagInput,
    setTagInput,
    resourceFile,
    id,
    handleResourceFileChange,
    handleAddTag,
    handleTagKeyDown,
    handleRemoveTag,
    handleSaveDetails,
  } = editor;

  return (
    <>
      <div className="lg:col-span-2 space-y-6">
        <form
          onSubmit={handleSaveDetails}
          className="bg-white border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-text">General Information</h2>
            <span className="text-xs text-text/50">PUT /api/Resources/{id}</span>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="res-title" className="block text-xs font-semibold text-text">
              Title <span className="text-rose-500">*</span>
            </label>
            <Input
              id="res-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern React Design Patterns"
              required
            />
          </div>

          {/* Category & Access Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="res-cat" className="block text-xs font-semibold text-text">
                Category
              </label>
              <select
                id="res-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text">Access Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccessType(1)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                    accessType === 1
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-text/70 hover:bg-slate-50",
                  )}
                >
                  <FiExternalLink className="w-3.5 h-3.5" />
                  <span>External Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessType(0)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                    accessType === 0
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-text/70 hover:bg-slate-50",
                  )}
                >
                  <FiFile className="w-3.5 h-3.5" />
                  <span>File Upload</span>
                </button>
              </div>
            </div>
          </div>

          {/* External URL (if Link) */}
          {accessType === 1 && (
            <div className="space-y-1.5">
              <label htmlFor="res-url" className="block text-xs font-semibold text-text">
                External URL / Preview Link
              </label>
              <Input
                id="res-url"
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://github.com/... or https://..."
              />
            </div>
          )}

          {/* Resource File Replacement (if File) */}
          {accessType === 0 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text">
                Attachment File (.pdf, .zip, .epub, etc.)
              </label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="res-file"
                  className="hidden"
                  onChange={handleResourceFileChange}
                />
                <label htmlFor="res-file" className="cursor-pointer block space-y-1">
                  <FiUpload className="w-6 h-6 text-text/40 mx-auto" />
                  <p className="text-xs font-medium text-text">
                    {resourceFile ? resourceFile.name : "Click to replace attached file"}
                  </p>
                  <p className="text-[11px] text-text/40">
                    Leave empty to keep existing attachment
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="res-desc" className="block text-xs font-semibold text-text">
              Description
            </label>
            <Textarea
              id="res-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what makes this resource valuable..."
            />
          </div>

          {/* Tags Input */}
          <div className="space-y-2">
            <label htmlFor="res-tags" className="block text-xs font-semibold text-text">
              Tags
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="res-tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag and press Enter"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddTag}
                className="shrink-0"
              >
                Add
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600 transition-colors"
                      aria-label={`Remove tag ${t}`}
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<FiSave className="w-4 h-4" />}
              className="rounded-xl px-6 font-bold shadow-xs"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
