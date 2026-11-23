import type { JSX } from "react";
import { cn } from "@/shared/lib/utils/cn";
import { LuArrowUp } from "react-icons/lu";

import type { UseArticlesListResult } from "@/features/articles/hooks/useArticlesList";

/** Floating scroll-to-top button. */
export function ScrollToTopButton({ list }: { list: UseArticlesListResult }): JSX.Element {
  const { showScrollTop, topRef } = list;

  return (
    <>
      <button
        type="button"
        onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className={cn(
          "fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 p-3 rounded-full border-2 border-blue-500 bg-white text-blue-600 shadow-lg transition-all duration-200 hover:bg-blue-50",
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none",
        )}
        aria-label="Scroll to top"
        aria-hidden={!showScrollTop}
        tabIndex={showScrollTop ? 0 : -1}
      >
        <span
          aria-hidden="true"
          className="absolute -inset-0.5 rounded-full border-2 border-blue-500 animate-ping pointer-events-none"
        />
        <LuArrowUp className="relative w-4 h-4" />
      </button>
    </>
  );
}
