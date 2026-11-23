import type { JSX, RefObject } from "react";
import { Button, Tooltip } from "@/shared/ui";
import { cn } from "@/shared/lib/utils/cn";
import type { CategoryConfig, ResourceCategoryType, UploadMode } from "./addResource.config";
import { FiLink, FiImage, FiBold, FiItalic, FiList } from "react-icons/fi";

interface ComposerFooterProps {
  isExpanded: boolean;
  category: ResourceCategoryType;
  currentConfig: CategoryConfig;
  coverInputRef: RefObject<HTMLInputElement | null>;
  uploadMode: UploadMode;
  onUploadModeChange: (mode: UploadMode) => void;
  insertFormatting: (prefix: string, suffix?: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isFormValid: boolean;
}

export function ComposerFooter({
  isExpanded,
  category,
  currentConfig,
  coverInputRef,
  uploadMode,
  onUploadModeChange,
  insertFormatting,
  onCancel,
  isSubmitting,
  isFormValid,
}: ComposerFooterProps): JSX.Element {
  return (
    <div
      className={cn(
        "px-3.5 sm:px-5 py-2.5 sm:py-3 border-t border-border bg-slate-50/60 flex items-center justify-between gap-2 select-none shrink-0",
        isExpanded && "px-4 sm:px-8 py-3.5 sm:py-4",
      )}
    >
      {/* Left Toolbar Icons */}
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
        {/* Free form / category indicator pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-white text-xs font-semibold text-text shadow-2xs">
          <span>{currentConfig.icon}</span>
          <span className="capitalize">{category}</span>
        </div>

        <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

        {/* Quick action buttons */}
        <Tooltip content="Upload cover image">
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            aria-label="Upload cover image"
            className="p-1.5 rounded-lg text-text/60 hover:text-text hover:bg-slate-200/60 transition-colors"
          >
            <FiImage className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Switch to URL Link mode">
          <button
            type="button"
            onClick={() => onUploadModeChange("url")}
            aria-label="Insert URL"
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              uploadMode === "url"
                ? "text-primary bg-primary/10"
                : "text-text/60 hover:text-text hover:bg-slate-200/60",
            )}
          >
            <FiLink className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Markdown Text Formatting icons - hidden on tiny screens to avoid overflow */}
        <div className="hidden sm:flex items-center gap-1">
          <Tooltip content="Bold text (**text**)">
            <button
              type="button"
              onClick={() => insertFormatting("**", "**")}
              aria-label="Bold text"
              className="p-1.5 rounded-lg text-text/60 hover:text-text hover:bg-slate-200/60 transition-colors font-bold"
            >
              <FiBold className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip content="Italic text (*text*)">
            <button
              type="button"
              onClick={() => insertFormatting("*", "*")}
              aria-label="Italic text"
              className="p-1.5 rounded-lg text-text/60 hover:text-text hover:bg-slate-200/60 transition-colors italic"
            >
              <FiItalic className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip content="Bullet list (- item)">
            <button
              type="button"
              onClick={() => insertFormatting("\n- ")}
              aria-label="Bullet list"
              className="p-1.5 rounded-lg text-text/60 hover:text-text hover:bg-slate-200/60 transition-colors"
            >
              <FiList className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Right Action: Post button */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-xs px-2.5 sm:px-3"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          disabled={!isFormValid || isSubmitting}
          className="px-4 sm:px-5 font-semibold text-xs shadow-sm"
        >
          Post
        </Button>
      </div>
    </div>
  );
}
