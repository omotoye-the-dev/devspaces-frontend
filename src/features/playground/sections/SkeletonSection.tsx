import { useState, type JSX } from "react";
import {
  Button,
  Avatar,
  Tag,
  Skeleton,
  NavBarSkeleton,
  SidebarSkeleton,
  CardSkeleton,
  useToast,
} from "@/shared/ui";

export function SkeletonSection(): JSX.Element {
  const { success } = useToast();

  const [isSimulatingSkeleton, setIsSimulatingSkeleton] = useState(false);

  const handleSimulateLoad = (): void => {
    setIsSimulatingSkeleton(true);
    setTimeout(() => {
      setIsSimulatingSkeleton(false);
      success("Simulated fetch complete", {
        description: "Data has been loaded into the components.",
      });
    }, 2000);
  };
  return (
    <>
      {/* ========================================================================= */}
      {/* 11. SKELETON COMPONENT                                                   */}
      {/* ========================================================================= */}
      <section
        id="skeleton"
        className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text">11. Skeleton (Loading Placeholders)</h2>
            <p className="text-xs text-text/60">
              Pulse animation shapes (circular, text, rounded, rectangular) and multi-line paragraph
              counts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              isLoading={isSimulatingSkeleton}
              onClick={handleSimulateLoad}
            >
              Simulate 2s Load
            </Button>
            <Tag variant="primary">Skeleton.tsx</Tag>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shapes */}
          <div className="p-4 bg-background/50 rounded-lg border border-border space-y-3">
            <span className="text-xs font-semibold text-text/60">Individual Shapes</span>
            <div className="space-y-3 bg-white p-3 rounded-md border border-border">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton variant="circular" width={44} height={44} />
              </div>
              <Skeleton variant="text" width="90%" height={16} />
              <Skeleton variant="rounded" height={32} className="rounded-md" />
            </div>
          </div>

          {/* Paragraph Count */}
          <div className="p-4 bg-background/50 rounded-lg border border-border space-y-3">
            <span className="text-xs font-semibold text-text/60">
              Multi-line Paragraph (count=3)
            </span>
            <div className="bg-white p-3 rounded-md border border-border space-y-2">
              <Skeleton count={3} />
            </div>
          </div>

          {/* Live Swap Simulation */}
          <div className="p-4 bg-background/50 rounded-lg border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text/60">Live Card Swap</span>
              <Tag size="sm" variant="outline">
                {isSimulatingSkeleton ? "Loading..." : "Loaded"}
              </Tag>
            </div>

            {isSimulatingSkeleton ? (
              <CardSkeleton hasAvatar lines={2} />
            ) : (
              <div className="p-3 bg-white rounded-md border border-border space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar name="Ayomide Olayode" size="sm" status="online" />
                  <span className="text-xs font-bold">Ayomide Olayode</span>
                </div>
                <h4 className="text-xs font-bold text-text">Fullstack React 19 Architecture</h4>
                <p className="text-[11px] text-text/60">
                  Loaded content replaces the skeleton placeholder seamlessly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reusable Nav & Sidebar Skeletons */}
        <div className="space-y-4 pt-4 border-t border-border">
          <span className="text-xs font-semibold text-text/60">
            Reusable Layout Skeletons (NavBarSkeleton &amp; SidebarSkeleton)
          </span>
          <div className="rounded-lg border border-border overflow-hidden bg-background">
            <NavBarSkeleton />
            <div className="flex h-64 overflow-hidden">
              <SidebarSkeleton className="h-full border-r border-border bg-white" />
              <div className="flex-1 p-4 bg-white/50 flex flex-col justify-center items-center text-text/40 text-xs">
                Main Content Placeholder
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
