import { useState, type JSX } from "react";
import { Button, Tag, useToast } from "@/shared/ui";

export function TagSection(): JSX.Element {
  const { success, info } = useToast();

  const [activeTags, setActiveTags] = useState<string[]>([
    "TypeScript",
    "React 19",
    "Tailwind v4",
    "Vite",
    "Design System",
  ]);

  const handleRemoveTag = (tagToRemove: string): void => {
    setActiveTags((prev) => prev.filter((t) => t !== tagToRemove));
    info(`Removed tag: ${tagToRemove}`);
  };

  const handleResetTags = (): void => {
    setActiveTags(["TypeScript", "React 19", "Tailwind v4", "Vite", "Design System"]);
    success("Tags reset to defaults");
  };
  return (
    <>
      {/* ========================================================================= */}
      {/* 6. TAG COMPONENT                                                         */}
      {/* ========================================================================= */}
      <section
        id="tag"
        className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text">6. Tag (Badges / Pills)</h2>
            <p className="text-xs text-text/60">
              Semantic color variants, status dots, icon slots, and removable interactive tags.
            </p>
          </div>
          <Tag variant="primary">Tag.tsx</Tag>
        </div>

        {/* Variants */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">Variants</h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <Tag variant="primary">Primary</Tag>
            <Tag variant="teal">Teal</Tag>
            <Tag variant="neutral">Neutral</Tag>
            <Tag variant="success">Success</Tag>
            <Tag variant="warning">Warning</Tag>
            <Tag variant="danger">Danger</Tag>
            <Tag variant="outline">Outline</Tag>
          </div>
        </div>

        {/* With Status Dots */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
            With Status Indicator Dots
          </h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <Tag variant="primary" dot>
              Active
            </Tag>
            <Tag variant="teal" dot>
              Verified
            </Tag>
            <Tag variant="success" dot>
              Published
            </Tag>
            <Tag variant="danger" dot>
              Deprecated
            </Tag>
            <Tag variant="warning" dot>
              Draft
            </Tag>
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">Sizes</h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <Tag variant="primary" size="sm">
              Small (sm)
            </Tag>
            <Tag variant="primary" size="md">
              Medium (md)
            </Tag>
            <Tag variant="primary" size="lg">
              Large (lg)
            </Tag>
          </div>
        </div>

        {/* Interactive Removable Tags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
              Interactive Removable Tags (onRemove)
            </h3>
            {activeTags.length < 5 && (
              <Button size="sm" variant="ghost" onClick={handleResetTags}>
                Reset Tags
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 p-3 bg-background rounded-md border border-border min-h-12">
            {activeTags.map((t) => (
              <Tag key={t} variant="teal" onRemove={() => handleRemoveTag(t)}>
                {t}
              </Tag>
            ))}
            {activeTags.length === 0 && (
              <span className="text-xs text-text/40 italic">
                All tags removed. Click &quot;Reset Tags&quot; to restore.
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
