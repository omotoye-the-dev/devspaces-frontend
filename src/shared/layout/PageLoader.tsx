import type { JSX } from "react";

/** Shown while a lazily loaded page's code is downloading. */
export default function PageLoader(): JSX.Element {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex min-h-[50vh] w-full items-center justify-center"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
    </div>
  );
}
