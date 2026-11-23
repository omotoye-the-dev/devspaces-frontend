import type { JSX } from "react";
import { LuPenLine } from "react-icons/lu";
import { Button } from "@/shared/ui";

import type { UseArticlesListResult } from "@/features/articles/hooks/useArticlesList";

/** Page title and Write Article button. */
export function ArticlesHeader({ list }: { list: UseArticlesListResult }): JSX.Element {
  const { navigate } = list;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight">
            Technical Articles
          </h1>
          <p className="text-text/60 text-sm">
            Curated guides, architectural insights, and tutorials written by developers.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<LuPenLine className="w-4 h-4" />}
          onClick={() => navigate("/articles/new")}
          className="shrink-0 font-semibold w-full sm:w-auto"
        >
          Write Article
        </Button>
      </div>
    </>
  );
}
