import { useRef, useState, type JSX } from "react";
import { Button } from "@/shared/ui";
import { toast } from "@/shared/hooks/useToast";
import { cn } from "@/shared/lib/utils/cn";
import { formatFileSize, type NewPartDraft } from "./addResource.config";
import { FiX, FiLayers, FiPlus, FiTrash2 } from "react-icons/fi";

interface ChaptersBuilderProps {
  parts: NewPartDraft[];
  onAddPart: (part: NewPartDraft) => void;
  onRemovePart: (partId: string) => void;
}

/** List of chapters plus an inline form to draft a new one. */
export function ChaptersBuilder({
  parts,
  onAddPart,
  onRemovePart,
}: ChaptersBuilderProps): JSX.Element {
  const [isAddingPart, setIsAddingPart] = useState<boolean>(false);
  const [partTitle, setPartTitle] = useState<string>("");
  const [partDescription, setPartDescription] = useState<string>("");
  const [partAccessType, setPartAccessType] = useState<0 | 1>(1);
  const [partUrl, setPartUrl] = useState<string>("");
  const [partFile, setPartFile] = useState<File | null>(null);
  const partFileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPartDraft = (): void => {
    if (!partTitle.trim()) {
      toast.error("Please enter a title for the chapter");
      return;
    }
    if (partAccessType === 1) {
      if (!partUrl.trim()) {
        toast.error("Please provide a link URL for this chapter");
        return;
      }
      try {
        const parsed = new URL(partUrl.trim());
        if (!["http:", "https:"].includes(parsed.protocol)) {
          toast.error("URL must begin with http:// or https://");
          return;
        }
      } catch {
        toast.error("Please enter a valid web URL for the chapter");
        return;
      }
    } else {
      if (!partFile) {
        toast.error("Please select or drop a file for this chapter");
        return;
      }
    }

    const newPart: NewPartDraft = {
      id: `part-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: partTitle.trim(),
      description: partDescription.trim() || undefined,
      accessType: partAccessType,
      contentUrl: partAccessType === 1 ? partUrl.trim() : undefined,
      partFile: partAccessType === 0 ? partFile : null,
    };

    onAddPart(newPart);
    setPartTitle("");
    setPartDescription("");
    setPartUrl("");
    setPartFile(null);
    setIsAddingPart(false);
    if (partFileInputRef.current) partFileInputRef.current.value = "";
  };
  return (
    <div className="p-3.5 rounded-xl border border-border bg-slate-50/70 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiLayers className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-text">Chapters & Modules</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-text/60">
            {parts.length}
          </span>
        </div>

        {!isAddingPart && (
          <button
            type="button"
            onClick={() => setIsAddingPart(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Add Chapter</span>
          </button>
        )}
      </div>

      {/* List of already added parts */}
      {parts.length > 0 && (
        <div className="space-y-2">
          {parts.map((p, index) => (
            <div
              key={p.id}
              className="p-2.5 rounded-lg border border-border bg-white flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text truncate">{p.title}</p>
                  <p className="text-[10px] text-text/50 truncate">
                    {p.accessType === 1
                      ? `Link: ${p.contentUrl || ""}`
                      : `File: ${p.partFile?.name || "Attached"} (${formatFileSize(p.partFile?.size || 0)})`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemovePart(p.id)}
                className="p-1 text-text/40 hover:text-rose-600 rounded transition-colors"
                aria-label={`Remove chapter ${p.title}`}
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline Add Part Form */}
      {isAddingPart && (
        <div className="p-3 rounded-lg border border-primary/20 bg-white space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text">New Chapter / Part #{parts.length + 1}</span>
            {/* Mode switcher for this part */}
            <div className="flex items-center bg-slate-100 border border-border rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setPartAccessType(1)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                  partAccessType === 1
                    ? "bg-primary text-white shadow-2xs"
                    : "text-text/60 hover:text-text",
                )}
              >
                Link
              </button>
              <button
                type="button"
                onClick={() => setPartAccessType(0)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                  partAccessType === 0
                    ? "bg-primary text-white shadow-2xs"
                    : "text-text/60 hover:text-text",
                )}
              >
                File
              </button>
            </div>
          </div>

          <input
            type="text"
            value={partTitle}
            onChange={(e) => setPartTitle(e.target.value)}
            placeholder="Chapter title (e.g. Chapter 1: Introduction)..."
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />

          {partAccessType === 1 ? (
            <input
              type="url"
              value={partUrl}
              onChange={(e) => setPartUrl(e.target.value)}
              placeholder="Chapter URL (https://...)"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          ) : (
            <div>
              <input
                ref={partFileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) setPartFile(files[0]);
                }}
              />
              {!partFile ? (
                <button
                  type="button"
                  onClick={() => partFileInputRef.current?.click()}
                  className="w-full py-2 px-3 border border-dashed border-border rounded-md text-xs text-text/60 hover:text-primary hover:border-primary/50 text-center transition-colors bg-slate-50"
                >
                  Choose file attachment (PDF, document, zip)
                </button>
              ) : (
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-border rounded-md text-xs">
                  <span className="truncate text-text font-medium">{partFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setPartFile(null)}
                    className="text-text/40 hover:text-rose-600 p-0.5"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          <input
            type="text"
            value={partDescription}
            onChange={(e) => setPartDescription(e.target.value)}
            placeholder="Short description / summary (optional)..."
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAddingPart(false);
                setPartTitle("");
                setPartDescription("");
                setPartUrl("");
                setPartFile(null);
              }}
              className="text-xs py-1 h-7"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddPartDraft}
              className="text-xs py-1 h-7"
            >
              Add Chapter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
