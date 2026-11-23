import { useState, type ChangeEvent, type DragEvent, type JSX, type RefObject } from "react";
import { cn } from "@/shared/lib/utils/cn";
import { formatFileSize, type CategoryConfig, type UploadMode } from "./addResource.config";
import { FiLink, FiUploadCloud, FiFile, FiX, FiCheckCircle, FiGlobe } from "react-icons/fi";

interface UploadSourceSectionProps {
  uploadMode: UploadMode;
  onUploadModeChange: (mode: UploadMode) => void;
  currentConfig: CategoryConfig;
  url: string;
  onUrlChange: (url: string) => void;
  onUrlBlur: () => void;
  isPreviewLoading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

/** Lets the user provide the resource either as a URL or as an uploaded file. */
export function UploadSourceSection({
  uploadMode,
  onUploadModeChange,
  currentConfig,
  url,
  onUrlChange,
  onUrlBlur,
  isPreviewLoading,
  fileInputRef,
  file,
  onFileChange,
}: UploadSourceSectionProps): JSX.Element {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileChange(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileChange(files[0]);
    }
  };
  return (
    <div className="p-3.5 rounded-xl border border-border bg-slate-50/70 space-y-2.5 transition-all">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-text/80 flex items-center gap-1.5">
          {uploadMode === "url" ? (
            <>
              <FiGlobe className="w-3.5 h-3.5 text-primary" />
              <span>Resource Link ({currentConfig.label})</span>
            </>
          ) : (
            <>
              <FiUploadCloud className="w-3.5 h-3.5 text-primary" />
              <span>{currentConfig.fileLabel}</span>
            </>
          )}
        </span>

        {/* Mode Switcher pill */}
        <div className="flex items-center bg-white border border-border rounded-lg p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => onUploadModeChange("url")}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all",
              uploadMode === "url"
                ? "bg-primary text-white shadow-2xs"
                : "text-text/60 hover:text-text",
            )}
          >
            <FiLink className="w-3 h-3" />
            <span>URL</span>
          </button>
          <button
            type="button"
            onClick={() => onUploadModeChange("file")}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all",
              uploadMode === "file"
                ? "bg-primary text-white shadow-2xs"
                : "text-text/60 hover:text-text",
            )}
          >
            <FiUploadCloud className="w-3 h-3" />
            <span>File</span>
          </button>
        </div>
      </div>

      {/* Mode 1: URL Input */}
      {uploadMode === "url" && (
        <div className="space-y-1">
          <div className="relative flex items-center">
            <span className="absolute left-3 text-text/40">
              <FiLink className="w-3.5 h-3.5" />
            </span>
            <input
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              onBlur={onUrlBlur}
              placeholder={currentConfig.urlPlaceholder}
              className="w-full pl-9 pr-16 py-2 bg-white text-xs sm:text-sm font-medium border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-text/30"
            />
            {isPreviewLoading && (
              <span className="absolute right-3 text-[10px] text-primary animate-pulse font-medium">
                Scraping...
              </span>
            )}
          </div>
          <p className="text-[11px] text-text/50">{currentConfig.urlHint}</p>
        </div>
      )}

      {/* Mode 2: Drag & Drop File Upload */}
      {uploadMode === "file" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={currentConfig.fileAccept}
            className="hidden"
            onChange={handleFileChange}
          />

          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-slate-50/50",
              )}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-1.5 shadow-2xs">
                <FiUploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-text">
                Drag & drop your file here, or{" "}
                <span className="text-primary hover:underline">browse</span>
              </p>
              <p className="text-[10px] text-text/50 mt-0.5">{currentConfig.fileHint}</p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FiFile className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text truncate">{file.name}</p>
                  <p className="text-[10px] text-text/50">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <FiCheckCircle className="w-3.5 h-3.5" /> Attached
                </span>
                <button
                  type="button"
                  onClick={() => onFileChange(null)}
                  className="p-1 text-text/40 hover:text-rose-600 rounded transition-colors"
                  aria-label="Remove attached file"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
