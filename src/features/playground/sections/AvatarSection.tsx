import { type JSX } from "react";
import { Avatar, Tag } from "@/shared/ui";

export function AvatarSection(): JSX.Element {
  return (
    <>
      {/* ========================================================================= */}
      {/* 5. AVATAR COMPONENT                                                      */}
      {/* ========================================================================= */}
      <section
        id="avatar"
        className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text">5. Avatar</h2>
            <p className="text-xs text-text/60">
              Sizes (xs to xl), status indicators, shapes (circle, rounded, square), and fallback
              initials.
            </p>
          </div>
          <Tag variant="primary">Avatar.tsx</Tag>
        </div>

        {/* Sizes and Status */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
            Sizes & Status Dots (xs, sm, md, lg, xl)
          </h3>
          <div className="flex items-center gap-4">
            <Avatar name="Sarah Connor" size="xs" status="online" />
            <Avatar name="David Miller" size="sm" status="away" />
            <Avatar name="Alex Johnson" size="md" status="online" />
            <Avatar name="Elena Rostova" size="lg" status="busy" />
            <Avatar name="Marcus Chen" size="xl" status="offline" />
          </div>
        </div>

        {/* Shapes */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
            Shapes (circle, rounded, square)
          </h3>
          <div className="flex items-center gap-4">
            <Avatar name="Circle Shape" shape="circle" size="lg" status="online" />
            <Avatar name="Rounded Shape" shape="rounded" size="lg" status="online" />
            <Avatar name="Square Shape" shape="square" size="lg" status="online" />
          </div>
        </div>

        {/* Images & Fallbacks */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
            Images & Automatic Error Fallback
          </h3>
          <div className="flex items-center gap-4">
            <Avatar
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              name="Jessica Taylor"
              size="lg"
              status="online"
            />
            <Avatar
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              name="Michael Brooks"
              size="lg"
              status="busy"
            />
            <Avatar
              src="https://broken-image-link-for-test.xyz/avatar.png"
              name="Ayomide Olayode"
              size="lg"
              status="online"
            />
          </div>
        </div>
      </section>
    </>
  );
}
