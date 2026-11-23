import type { JSX } from "react";
import { HiPlus, HiOutlineSparkles } from "react-icons/hi2";
import { Button } from "@/shared/ui";

import type { UseDiscussionsPageResult } from "@/features/discussions/hooks/useDiscussionsPage";

/** Title, subtitle and Ask Question button. */
export function DiscussionsHeader({ page }: { page: UseDiscussionsPageResult }): JSX.Element {
  const { setIsCreateModalOpen } = page;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-border p-5 sm:p-6 rounded-lg shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
              Community Discussions
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              <HiOutlineSparkles className="w-3 h-3" />
              Q&A
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text/60 leading-relaxed max-w-2xl">
            Ask technical questions, share problem-solving solutions, and collaborate with
            developers.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            variant="primary"
            leftIcon={<HiPlus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Ask a Question
          </Button>
        </div>
      </div>
    </>
  );
}
