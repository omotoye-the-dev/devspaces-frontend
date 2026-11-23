import { useEffect, useRef, useState } from "react";

/**
 * Tracks how far the reader has scrolled through the article (0–100).
 * Attach `pageRef` to the page wrapper and `articleRef` to the <article>.
 * `contentKey` re-measures when the article content changes.
 */
export function useReadingProgress(contentKey: unknown) {
  const pageRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const getScrollContainer = (): HTMLElement | null => {
      return pageRef.current?.closest("main") ?? document.querySelector("main");
    };

    const handleScroll = () => {
      const container = getScrollContainer();

      const scrollTop = container
        ? container.scrollTop
        : window.scrollY || document.documentElement.scrollTop;
      const clientHeight = container ? container.clientHeight : window.innerHeight;
      const scrollHeight = container
        ? container.scrollHeight
        : document.documentElement.scrollHeight;

      if (articleRef.current) {
        const articleEl = articleRef.current;
        const containerRect = container ? container.getBoundingClientRect() : { top: 0 };
        const articleRect = articleEl.getBoundingClientRect();

        // Absolute position of article relative to scroll container top
        const articleTop = articleRect.top - containerRect.top + scrollTop;
        const articleBottom = articleTop + articleEl.offsetHeight;

        // Reading completes when bottom of article is in view
        const targetScroll = articleBottom - clientHeight;

        if (targetScroll <= 0) {
          setReadingProgress(100);
          return;
        }

        const progress = (scrollTop / targetScroll) * 100;
        setReadingProgress(Math.min(100, Math.max(0, Math.round(progress))));
      } else {
        const maxScroll = scrollHeight - clientHeight;
        if (maxScroll <= 0) {
          setReadingProgress(100);
          return;
        }
        const progress = (scrollTop / maxScroll) * 100;
        setReadingProgress(Math.min(100, Math.max(0, Math.round(progress))));
      }
    };

    const container = getScrollContainer();

    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    handleScroll();

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", handleScroll);
    };
  }, [contentKey]);

  return { pageRef, articleRef, readingProgress };
}
