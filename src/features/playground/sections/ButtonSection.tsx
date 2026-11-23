import { useState, type JSX } from "react";
import { Button, Tag } from "@/shared/ui";

export function ButtonSection(): JSX.Element {
  const [btnLoading, setBtnLoading] = useState(false);
  return (
    <>
      {/* ========================================================================= */}
      {/* 1. BUTTON COMPONENT                                                      */}
      {/* ========================================================================= */}
      <section
        id="button"
        className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text">1. Button</h2>
            <p className="text-xs text-text/60">
              Variants, sizes, loading spinners, icons, and disabled states.
            </p>
          </div>
          <Tag variant="primary">Button.tsx</Tag>
        </div>

        {/* Variants */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">Variants</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="teal">Teal</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">Sizes</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small (sm)</Button>
            <Button size="md">Medium (md)</Button>
            <Button size="lg">Large (lg)</Button>
          </div>
        </div>

        {/* States & Icons */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
            States & Icons
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              isLoading={btnLoading}
              onClick={() => {
                setBtnLoading(true);
                setTimeout(() => setBtnLoading(false), 1500);
              }}
            >
              {btnLoading ? "Processing..." : "Click for Loading State"}
            </Button>
            <Button disabled>Disabled Button</Button>
            <Button
              variant="primary"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            >
              With Left Icon
            </Button>
            <Button
              variant="secondary"
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              }
            >
              With Right Icon
            </Button>
          </div>
        </div>

        {/* Full Width */}
        <div className="space-y-2 max-w-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
            Full Width (fullWidth)
          </h3>
          <Button variant="primary" fullWidth>
            Full Width Action
          </Button>
        </div>
      </section>
    </>
  );
}
