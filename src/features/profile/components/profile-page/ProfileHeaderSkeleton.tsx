import type { JSX } from "react";
import { Skeleton } from "@/shared/ui";

export function ProfileHeaderSkeleton(): JSX.Element {
  return (
    <section className="relative bg-white border border-border/70 rounded-2xl md:rounded-3xl shadow-xs overflow-hidden">
      <div className="h-28 sm:h-32 bg-slate-100 animate-pulse" />
      <div className="px-6 pb-6 sm:px-8 sm:pb-8 -mt-14 sm:-mt-16">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1 min-w-0">
            <Skeleton
              variant="circular"
              width={112}
              height={112}
              className="ring-4 ring-white rounded-full shrink-0 shadow-md"
            />
            <div className="space-y-2 flex-1 min-w-0 w-full">
              <Skeleton variant="text" width={200} height={28} />
              <Skeleton variant="text" width={110} height={16} />
              <Skeleton variant="text" width="85%" height={16} />
              <div className="flex items-center gap-3 pt-1">
                <Skeleton variant="text" width={80} height={14} />
                <Skeleton variant="text" width={100} height={14} />
              </div>
            </div>
          </div>
          <div className="lg:pl-8 lg:border-l lg:border-border/60 shrink-0 w-full sm:w-auto">
            <div className="grid grid-cols-2 divide-x divide-y divide-border/60 rounded-2xl bg-white/80 overflow-hidden text-center min-w-60 sm:min-w-67.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1.5"
                >
                  <Skeleton variant="circular" width={18} height={18} />
                  <Skeleton variant="text" width={40} height={22} />
                  <Skeleton variant="text" width={50} height={12} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
