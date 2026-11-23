import type { JSX } from "react";
import { cn } from "@/shared/lib/utils/cn";
import { Skeleton } from "@/shared/ui";

export function SidebarSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <>
      <aside
        className={cn(
          "hidden md:flex w-60 bg-white border-r border-border flex-col justify-between h-full max-h-screen shrink-0 p-3 overflow-y-auto overflow-x-hidden font-inter select-none hover-scrollbar",
          className,
        )}
        aria-label="Loading Sidebar"
      >
        <div className="flex flex-col min-h-full justify-between space-y-4">
          <div className="space-y-4">
            {/* Main Nav Items Skeleton */}
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-1.5">
                  <Skeleton variant="circular" width={18} height={18} />
                  <Skeleton variant="text" width={`${65 + (i % 3) * 10}%`} height={16} />
                </div>
              ))}
            </div>

            <div className="my-2 border-t border-border" />

            {/* Community Section Skeleton */}
            <div className="space-y-2">
              <Skeleton variant="text" width={70} height={12} className="px-3 mb-1" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-1.5">
                  <Skeleton variant="circular" width={18} height={18} />
                  <Skeleton variant="text" width={`${55 + (i % 3) * 15}%`} height={16} />
                </div>
              ))}
            </div>
          </div>

          {/* <div className="my-2 border-t border-border" /> */}

          {/* Topics Section Skeleton */}
          {/* <div className="space-y-2 flex-1">
            <Skeleton variant="text" width={55} height={12} className="px-3 mb-1" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-1">
                <Skeleton variant="circular" width={14} height={14} />
                <Skeleton variant="text" width={`${50 + (i % 4) * 10}%`} height={14} />
              </div>
            ))}
          </div> */}

          {/* Footer Skeleton */}
          <div className="pt-3 border-t border-border">
            <Skeleton variant="rounded" height={36} className="w-full rounded-md" />
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Skeleton */}
      <nav
        aria-label="Loading Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex items-center justify-around py-2 px-3 md:hidden font-inter shadow-md"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 min-w-14">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={32} height={10} />
          </div>
        ))}
      </nav>
    </>
  );
}
