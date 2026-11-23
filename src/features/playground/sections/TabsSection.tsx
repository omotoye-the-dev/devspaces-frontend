import { type JSX } from "react";
import { Tag, Tabs } from "@/shared/ui";

export function TabsSection(): JSX.Element {
  return (
    <>
      {/* ========================================================================= */}
      {/* 9. TABS COMPONENT                                                        */}
      {/* ========================================================================= */}
      <section
        id="tabs"
        className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text">9. Tabs</h2>
            <p className="text-xs text-text/60">
              Accessible in-page view switchers with Line, Pills, and Enclosed variants.
            </p>
          </div>
          <Tag variant="primary">Tabs.tsx</Tag>
        </div>

        {/* Line Variant */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
            1. Line Variant (Underline Indicator)
          </h3>
          <div className="p-4 bg-background/50 rounded-lg border border-border">
            <Tabs
              defaultValue="articles"
              variant="line"
              items={[
                {
                  id: "articles",
                  label: "Articles",
                  count: 14,
                  content: (
                    <p className="py-3 text-xs text-text/70">
                      Showing 14 published technical articles.
                    </p>
                  ),
                },
                {
                  id: "resources",
                  label: "Resources",
                  count: 6,
                  content: (
                    <p className="py-3 text-xs text-text/70">
                      Showing 6 shared boilerplates and templates.
                    </p>
                  ),
                },
                {
                  id: "activity",
                  label: "Activity",
                  content: (
                    <p className="py-3 text-xs text-text/70">
                      Recent community replies and reviews.
                    </p>
                  ),
                },
                {
                  id: "about",
                  label: "About",
                  content: (
                    <p className="py-3 text-xs text-text/70">
                      Full biography and verified developer badges.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>

        {/* Pills Variant */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
            2. Pills Variant
          </h3>
          <div className="p-4 bg-background/50 rounded-lg border border-border">
            <Tabs
              defaultValue="foryou"
              variant="pills"
              items={[
                {
                  id: "foryou",
                  label: "For You",
                  content: (
                    <p className="py-3 text-xs text-text/70">Personalized algorithmic feed.</p>
                  ),
                },
                {
                  id: "following",
                  label: "Following",
                  count: 8,
                  content: (
                    <p className="py-3 text-xs text-text/70">Posts from developers you follow.</p>
                  ),
                },
                {
                  id: "latest",
                  label: "Latest",
                  content: (
                    <p className="py-3 text-xs text-text/70">
                      Chronological feed of new submissions.
                    </p>
                  ),
                },
                {
                  id: "trending",
                  label: "Trending",
                  content: (
                    <p className="py-3 text-xs text-text/70">Top discussions from the last 24h.</p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
