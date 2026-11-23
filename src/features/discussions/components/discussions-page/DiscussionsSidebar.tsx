import type { JSX } from "react";
import { HiPlus, HiOutlineLightBulb } from "react-icons/hi2";
import { Button } from "@/shared/ui";

import type { UseDiscussionsPageResult } from "@/features/discussions/hooks/useDiscussionsPage";

/** Posting guidelines and community info. */
export function DiscussionsSidebar({ page }: { page: UseDiscussionsPageResult }): JSX.Element {
  const { setIsCreateModalOpen } = page;

  return (
    <>
      <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
        {/* Ask Question Guidelines Card */}
        <div className="bg-white border border-border rounded-lg p-4 sm:p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <HiOutlineLightBulb className="w-4 h-4 text-amber-500" />
            <span>How to ask a good question</span>
          </h3>
          <ul className="text-xs text-text/70 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Summarize the specific problem in the question title.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Describe what you expected to happen vs what actually occurred.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Tag relevant technologies (e.g. React, TypeScript, Node.js).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Provide minimal reproducible code snippets or errors.</span>
            </li>
          </ul>

          <div className="pt-2 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              leftIcon={<HiPlus className="w-3.5 h-3.5" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Post Discussion
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
