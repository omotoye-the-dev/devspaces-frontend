import type { ChangeEvent, JSX, RefObject } from "react";
import { Button } from "@/shared/ui";
import { HiOutlinePhoto, HiOutlineXMark } from "react-icons/hi2";

interface CoverImageCardProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  coverImagePreview: string;
  coverImageFile: File | null;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCoverImage: () => void;
}

export function CoverImageCard({
  fileInputRef,
  coverImagePreview,
  coverImageFile,
  handleFileChange,
  handleRemoveCoverImage,
}: CoverImageCardProps): JSX.Element {
  return (
    <div className="bg-white border border-border rounded-xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <HiOutlinePhoto className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text">Add a cover image</h3>
            <p className="text-[11px] text-text/50">Recommended size: 1200x630px (16:9)</p>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50"
        >
          {coverImagePreview ? "Change Image" : "Upload Image"}
        </Button>
      </div>

      {coverImagePreview && (
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-slate-100 group shadow-2xs">
            <img
              src={coverImagePreview}
              alt="Cover preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/95 hover:bg-white text-text text-xs shadow-sm"
              >
                Change
              </Button>
              <button
                type="button"
                onClick={handleRemoveCoverImage}
                aria-label="Remove cover image"
                title="Remove cover image"
                className="p-2 rounded-lg bg-red-600/90 text-white hover:bg-red-600 transition-colors cursor-pointer shadow-sm"
              >
                <HiOutlineXMark className="w-4 h-4" />
              </button>
            </div>
          </div>
          {coverImageFile && (
            <div className="flex items-center justify-between text-[11px] text-text/50 px-1">
              <span className="truncate max-w-60 font-medium text-text/70">
                {coverImageFile.name}
              </span>
              <span>{(coverImageFile.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
