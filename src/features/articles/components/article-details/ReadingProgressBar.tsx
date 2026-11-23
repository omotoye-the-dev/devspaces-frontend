import type { JSX } from "react";

export function ReadingProgressBar({ readingProgress }: { readingProgress: number }): JSX.Element {
  return (
    <div className="sticky -top-2 sm:-top-4 md:-top-6 z-30 mb-8 bg-gray-50/95 py-2 backdrop-blur-xs">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-primary to-blue-500 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>
    </div>
  );
}
