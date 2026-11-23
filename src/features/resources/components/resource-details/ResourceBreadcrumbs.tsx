import type { JSX } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiShare2, FiCheck } from "react-icons/fi";

import type { UseResourceDetailsResult } from "@/features/resources/hooks/useResourceDetails";

/** Back link and edit shortcut. */
export function ResourceBreadcrumbs({
  details,
}: {
  details: UseResourceDetailsResult;
}): JSX.Element {
  const { isCopied, handleShare } = details;

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/resources"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-text/60 hover:text-primary transition-colors group truncate"
        >
          <FiArrowLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span className="truncate">Back to Resource Library</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-semibold text-text/70 hover:text-text hover:bg-slate-50 transition-all shadow-2xs shrink-0"
        >
          {isCopied ? (
            <>
              <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <FiShare2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
