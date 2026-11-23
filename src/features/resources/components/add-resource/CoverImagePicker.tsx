import type { ChangeEvent, JSX, RefObject } from "react";
import { Tooltip } from "@/shared/ui";
import { FiX, FiImage } from "react-icons/fi";

interface CoverImagePickerProps {
  coverInputRef: RefObject<HTMLInputElement | null>;
  coverImage: string | null;
  handleCoverChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function CoverImagePicker({
  coverInputRef,
  coverImage,
  handleCoverChange,
  onRemove,
}: CoverImagePickerProps): JSX.Element {
  return (
    <div>
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverChange}
      />

      {!coverImage ? (
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-dashed border-border hover:border-primary/50 text-xs font-semibold text-text/60 hover:text-primary transition-colors bg-slate-50/60 hover:bg-slate-50"
        >
          <FiImage className="w-3.5 h-3.5" />
          <span>Add cover</span>
        </button>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-border max-h-44 group bg-slate-100">
          <img src={coverImage} alt="Resource Cover" className="w-full h-full object-cover" />
          <Tooltip content="Remove cover image" position="left">
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
              aria-label="Remove cover image"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
