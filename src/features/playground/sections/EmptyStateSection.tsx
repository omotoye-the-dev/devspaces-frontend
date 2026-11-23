import { type JSX } from "react";
import { Button, Tag, EmptyState } from "@/shared/ui";

export function EmptyStateSection(): JSX.Element {
  return (
    <>
      {/* ========================================================================= */}
      {/* 12. EMPTYSTATE COMPONENT                                                 */}
      {/* ========================================================================= */}
      <section
        id="emptystate"
        className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text">12. EmptyState</h2>
            <p className="text-xs text-text/60">
              Zero-data views with illustrations, titles, descriptions, and CTA action buttons.
            </p>
          </div>
          <Tag variant="primary">EmptyState.tsx</Tag>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-border p-2">
            <EmptyState
              size="sm"
              bordered
              title="No Articles Published Yet"
              description="Share your technical knowledge and tutorials with the community."
              action={
                <Button size="sm" variant="primary">
                  Write First Article
                </Button>
              }
            />
          </div>

          <div className="bg-white rounded-lg border border-border p-2">
            <EmptyState
              size="sm"
              bordered
              icon={
                <svg
                  className="w-5 h-5 text-text/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
              title="No Search Results Found"
              description="Try checking for typos or searching for a broader technical topic."
              action={
                <Button size="sm" variant="secondary">
                  Clear Search Filters
                </Button>
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
