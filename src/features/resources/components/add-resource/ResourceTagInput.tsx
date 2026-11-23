import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
} from "react";
import type { Tag } from "@/features/articles/api/tagApi";
import { toast } from "@/shared/hooks/useToast";
import { cn } from "@/shared/lib/utils/cn";
import { MAX_TAGS } from "./addResource.config";
import { FiX, FiHash, FiLock } from "react-icons/fi";

interface ResourceTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  availableTags: Tag[];
}

export function ResourceTagInput({
  tags,
  onChange,
  availableTags,
}: ResourceTagInputProps): JSX.Element {
  const tagContainerRef = useRef<HTMLDivElement>(null);
  const [tagInput, setTagInput] = useState<string>("");
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState<boolean>(false);
  const [highlightedTagIndex, setHighlightedTagIndex] = useState<number>(-1);

  // Close tag suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (tagContainerRef.current && !tagContainerRef.current.contains(e.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isTagLimitReached = tags.length >= MAX_TAGS;

  const tagSuggestions = useMemo(() => {
    const q = tagInput.trim().toLowerCase();
    const unselected = availableTags.filter(
      (t) => !tags.some((selected) => selected.toLowerCase() === t.name.toLowerCase()),
    );
    if (!q) return unselected.slice(0, 6);
    return unselected.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 6);
  }, [tagInput, availableTags, tags]);

  const handleAddTag = (tagNameToAdd?: string): void => {
    const cleanName = (tagNameToAdd ?? tagInput).trim().replace(/^#/, "");
    if (!cleanName) return;
    if (isTagLimitReached) {
      toast.error(`Maximum ${MAX_TAGS} tags reached`);
      return;
    }
    if (tags.some((t) => t.toLowerCase() === cleanName.toLowerCase())) {
      toast.error("Tag already added");
      return;
    }
    onChange([...tags, cleanName]);
    setTagInput("");
    setIsTagDropdownOpen(false);
    setHighlightedTagIndex(-1);
  };

  const handleRemoveTag = (tagToRemove: string): void => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };
  return (
    <div ref={tagContainerRef} className="space-y-2 relative pt-1">
      <div
        className={cn(
          "flex items-center justify-between gap-2 border rounded-xl px-3.5 py-2 transition-all",
          isTagLimitReached
            ? "bg-slate-100/90 border-slate-200 cursor-not-allowed select-none"
            : "bg-slate-50/70 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/60",
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isTagLimitReached ? (
            <FiLock
              className="w-3.5 h-3.5 text-slate-400 shrink-0"
              title="Tag limit reached (4 of 4)"
            />
          ) : (
            <FiHash className="w-3.5 h-3.5 text-text/40 shrink-0" />
          )}
          <input
            type="text"
            value={isTagLimitReached ? "" : tagInput}
            onFocus={() => {
              if (!isTagLimitReached && tagSuggestions.length > 0) {
                setIsTagDropdownOpen(true);
              }
            }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (isTagLimitReached) return;
              setTagInput(e.target.value);
              setIsTagDropdownOpen(true);
              setHighlightedTagIndex(-1);
            }}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (isTagLimitReached) {
                e.preventDefault();
                return;
              }
              if (e.key === "ArrowDown") {
                if (tagSuggestions.length > 0) {
                  e.preventDefault();
                  setIsTagDropdownOpen(true);
                  setHighlightedTagIndex((prev) =>
                    prev < tagSuggestions.length - 1 ? prev + 1 : 0,
                  );
                }
              } else if (e.key === "ArrowUp") {
                if (tagSuggestions.length > 0) {
                  e.preventDefault();
                  setIsTagDropdownOpen(true);
                  setHighlightedTagIndex((prev) =>
                    prev > 0 ? prev - 1 : tagSuggestions.length - 1,
                  );
                }
              } else if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                if (highlightedTagIndex >= 0 && tagSuggestions[highlightedTagIndex]) {
                  handleAddTag(tagSuggestions[highlightedTagIndex].name);
                } else {
                  handleAddTag();
                }
              } else if (e.key === "Escape") {
                setIsTagDropdownOpen(false);
                setHighlightedTagIndex(-1);
              }
            }}
            placeholder={
              isTagLimitReached
                ? "Maximum 4 tags reached (locked)"
                : "Type to search or add tags (e.g. frontend, react)..."
            }
            disabled={isTagLimitReached}
            readOnly={isTagLimitReached}
            className={cn(
              "w-full bg-transparent text-xs sm:text-sm border-none outline-none focus:ring-0",
              isTagLimitReached ? "cursor-not-allowed text-slate-400" : "placeholder:text-text/40",
            )}
          />
        </div>

        <span
          className={cn(
            "text-[11px] font-mono font-medium shrink-0",
            isTagLimitReached ? "text-amber-600 font-bold" : "text-text/40",
          )}
        >
          {tags.length}/{MAX_TAGS}
        </span>
      </div>

      {/* Suggestions Dropdown */}
      {!isTagLimitReached && isTagDropdownOpen && tagSuggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Tag suggestions"
          className="absolute top-full left-0 mt-1 w-full bg-white border border-border rounded-xl shadow-lg z-30 py-1 max-h-48 overflow-y-auto slim-scrollbar"
        >
          {tagSuggestions.map((tag, index) => {
            const isHighlighted = index === highlightedTagIndex;
            return (
              <li key={tag.id ?? tag.name} role="option" aria-selected={isHighlighted}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAddTag(tag.name);
                  }}
                  onMouseEnter={() => setHighlightedTagIndex(index)}
                  className={cn(
                    "w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer",
                    isHighlighted
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-text hover:bg-slate-50",
                  )}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="text-indigo-500 font-bold">#</span>
                    <span>{tag.name}</span>
                  </span>
                  {tag.usageCount !== undefined && tag.usageCount > 0 && (
                    <span className="text-[10px] text-text/40 shrink-0 ml-2">
                      {tag.usageCount} {tag.usageCount === 1 ? "post" : "posts"}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Selected Tag Chips (ArticleEditor style) */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs"
            >
              #{t}
              <button
                type="button"
                onClick={() => handleRemoveTag(t)}
                className="hover:text-red-600 transition-colors p-0.5"
                aria-label={`Remove tag ${t}`}
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
