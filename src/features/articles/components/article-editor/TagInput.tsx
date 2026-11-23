import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
} from "react";
import { clsx } from "clsx";
import { toast } from "@/shared/hooks/useToast";
import { HiOutlineXMark, HiOutlineLockClosed } from "react-icons/hi2";
import { useTags } from "@/features/articles/api/tagQueries";

interface TagInputProps {
  /** Currently selected tag names (max 4). */
  tags: string[];
  onChange: (tags: string[]) => void;
}

/** Tag picker with server-backed suggestions and keyboard navigation. */
export function TagInput({ tags: tagNamesValue, onChange }: TagInputProps): JSX.Element {
  const [tagInput, setTagInput] = useState("");
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [highlightedTagIndex, setHighlightedTagIndex] = useState<number>(-1);
  const tagDropdownRef = useRef<HTMLDivElement | null>(null);

  const { data: allTagsData } = useTags(100);
  const allTags = useMemo(() => allTagsData ?? [], [allTagsData]);

  useEffect(() => {
    if (!isTagDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTagDropdownOpen]);

  const tagSuggestions = useMemo(() => {
    const query = tagInput.trim().toLowerCase();
    if (!query) return [];

    return allTags
      .filter((tag) => {
        const name = tag.name.toLowerCase();
        const matchesQuery = name.includes(query);
        const notAlreadyAdded = !tagNamesValue.some((t) => t.toLowerCase() === name);
        return matchesQuery && notAlreadyAdded;
      })
      .slice(0, 6);
  }, [tagInput, allTags, tagNamesValue]);

  const activeHighlightedIndex =
    highlightedTagIndex >= 0 && highlightedTagIndex < tagSuggestions.length
      ? highlightedTagIndex
      : -1;

  const isTagLimitReached = tagNamesValue.length >= 4;

  const handleSelectTag = (tagName: string) => {
    if (isTagLimitReached) {
      toast.error("You can add a maximum of 4 tags");
      return;
    }
    const trimmed = tagName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    if (!trimmed) return;
    if (tagNamesValue.includes(trimmed)) {
      toast.error("Tag already added");
      return;
    }
    onChange([...tagNamesValue, trimmed]);
    setTagInput("");
    setIsTagDropdownOpen(false);
    setHighlightedTagIndex(-1);
  };

  const handleAddTag = () => {
    if (isTagLimitReached) {
      toast.error("You can add a maximum of 4 tags");
      return;
    }
    if (activeHighlightedIndex >= 0 && tagSuggestions[activeHighlightedIndex]) {
      handleSelectTag(tagSuggestions[activeHighlightedIndex].name);
      return;
    }
    handleSelectTag(tagInput);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tagNamesValue.filter((t) => t !== tagToRemove));
  };
  return (
    <div ref={tagDropdownRef} className="space-y-2 relative">
      <div
        className={clsx(
          "flex items-center justify-between gap-2 border rounded-lg px-3 py-1.5 transition-all",
          isTagLimitReached
            ? "bg-slate-100/90 border-slate-200 cursor-not-allowed select-none"
            : "bg-slate-50  focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/60",
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isTagLimitReached && (
            <HiOutlineLockClosed
              className="w-3.5 h-3.5 text-slate-400 shrink-0"
              title="Tag limit reached (4 of 4)"
            />
          )}
          <input
            type="text"
            value={isTagLimitReached ? "" : tagInput}
            onFocus={() => {
              if (!isTagLimitReached && tagInput.trim()) {
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
                if (activeHighlightedIndex >= 0 && tagSuggestions[activeHighlightedIndex]) {
                  handleSelectTag(tagSuggestions[activeHighlightedIndex].name);
                } else if (tagSuggestions.length > 0 && tagInput.trim()) {
                  const exactMatch = tagSuggestions.find(
                    (t) => t.name.toLowerCase() === tagInput.trim().toLowerCase(),
                  );
                  if (exactMatch) {
                    handleSelectTag(exactMatch.name);
                  } else {
                    handleAddTag();
                  }
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
            className={clsx(
              "w-full bg-transparent text-xs border-none outline-none focus:ring-0",
              isTagLimitReached ? "cursor-not-allowed text-slate-400" : "placeholder:text-text/40",
            )}
          />
        </div>
        <span
          className={clsx(
            "text-[11px] font-mono font-medium shrink-0",
            isTagLimitReached ? "text-amber-600 font-semibold" : "text-text/40",
          )}
        >
          {tagNamesValue.length}/4
        </span>
      </div>

      {/* Suggestions Dropdown — only shown when not locked */}
      {!isTagLimitReached && isTagDropdownOpen && tagSuggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Tag suggestions"
          className="absolute top-full left-0 mt-1 w-full bg-white border border-border rounded-lg shadow-lg z-30 py-1 max-h-48 overflow-y-auto"
        >
          {tagSuggestions.map((tag, index) => {
            const isHighlighted = index === activeHighlightedIndex;
            return (
              <li key={tag.id ?? tag.name} role="option" aria-selected={isHighlighted}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectTag(tag.name);
                  }}
                  onMouseEnter={() => setHighlightedTagIndex(index)}
                  className={clsx(
                    "w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer",
                    isHighlighted
                      ? "bg-indigo-50 text-indigo-600 font-medium"
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

      {tagNamesValue.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tagNamesValue.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-600 transition-colors"
              >
                <HiOutlineXMark className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
