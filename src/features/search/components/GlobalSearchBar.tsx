import type { JSX } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { FiX } from "react-icons/fi";
import { cn } from "@/shared/lib/utils/cn";
import { useGlobalSearch } from "@/features/search/hooks/useGlobalSearch";
import { SearchDropdown } from "@/features/search/components/SearchDropdown";

export interface GlobalSearchBarProps {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  /** If true, renders as a full-width block (used in mobile overlay) */
  fullWidth?: boolean;
}

export function GlobalSearchBar({
  className,
  inputClassName,
  placeholder = "Search articles, resources, discussions, people…",
  fullWidth = false,
}: GlobalSearchBarProps): JSX.Element {
  const search = useGlobalSearch();
  const {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    setRawResults,
    containerRef,
    inputRef,
    handleKeyDown,
  } = search;

  return (
    <div
      ref={containerRef}
      className={cn("relative", fullWidth ? "w-full" : "w-full max-w-lg", className)}
    >
      {/* Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none">
          <MdOutlineSearch className="w-4.5 h-4.5" />
        </span>
        <input
          ref={inputRef}
          id="global-search-input"
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={placeholder}
          aria-label="Global search"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="global-search-listbox"
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-border bg-background/70",
            "placeholder:text-text/40",
            // Hide the browser's built-in clear (X) button; we render our own
            "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
            "transition-all duration-150",
            inputClassName,
          )}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setRawResults({ query: "", items: [] });
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text/40 hover:text-text transition-colors"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && <SearchDropdown search={search} />}
    </div>
  );
}

export default GlobalSearchBar;
