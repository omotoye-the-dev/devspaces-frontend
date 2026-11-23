import type { JSX } from "react";
import { Skeleton } from "@/shared/ui";

export function FeedSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="bg-white border border-border rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={36} height={36} />
            <div className="space-y-1">
              <Skeleton variant="text" width={120} height={14} />
              <Skeleton variant="text" width={80} height={10} />
            </div>
          </div>
          <Skeleton variant="text" width="90%" height={20} />
          <Skeleton variant="text" width="100%" height={14} />
          <div className="flex gap-2">
            <Skeleton variant="rounded" width={60} height={20} />
            <Skeleton variant="rounded" width={60} height={20} />
          </div>
        </div>
      ))}
    </div>
  );
}
