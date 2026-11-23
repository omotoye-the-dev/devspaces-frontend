import type { JSX } from "react";
import { Button } from "@/shared/ui";

import type { UseResourcesListResult } from "@/features/resources/hooks/useResourcesList";

/** Title, subtitle and Add Resource button. */
export function ResourcesHeader({ list }: { list: UseResourcesListResult }): JSX.Element {
  const { handleOpenAddResource } = list;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 pb-4">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text tracking-tight">
            Developer Resource Library
          </h1>
          <p className="text-xs sm:text-sm text-text/60">
            Curated tools, guides, and learning materials shared by the community
          </p>
        </div>
        <Button
          size="md"
          variant="primary"
          onClick={handleOpenAddResource}
          className="w-full sm:w-auto shrink-0 shadow-sm"
        >
          Add Resource
        </Button>
      </div>
    </>
  );
}
