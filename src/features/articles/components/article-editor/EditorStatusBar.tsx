import type { JSX } from "react";
import { HiOutlineQuestionMarkCircle, HiOutlineChevronDown } from "react-icons/hi2";
import { BsArrowsFullscreen } from "react-icons/bs";

interface EditorStatusBarProps {
  wordCount: number;
  characterCount: number;
  computedReadingTime: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function EditorStatusBar({
  wordCount,
  characterCount,
  computedReadingTime,
  isFullscreen,
  onToggleFullscreen,
}: EditorStatusBarProps): JSX.Element {
  return (
    <div className="border-t border-border/60 bg-slate-50/50 px-4 py-2 flex items-center justify-between text-xs text-text/60 font-mono">
      <div className="flex items-center gap-1 text-text/70 cursor-pointer">
        <span>Markdown</span>
        <HiOutlineChevronDown className="w-3 h-3" />
      </div>

      <div className="flex items-center gap-3">
        <span>Words: {wordCount}</span>
        <span className="text-border">|</span>
        <span>Characters: {characterCount}</span>
        <span className="text-border">|</span>
        <span>{computedReadingTime} min read</span>
        <HiOutlineQuestionMarkCircle
          className="w-4 h-4 text-text/40 hover:text-text cursor-pointer"
          title="Estimated based on 200 words per minute"
        />
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-0.5 hover:text-text transition-colors"
        >
          <BsArrowsFullscreen
            className="w-3.5 h-3.5"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
          />
        </button>
      </div>
    </div>
  );
}
