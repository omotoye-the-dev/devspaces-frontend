import type { JSX } from "react";
import { Skeleton } from "@/shared/ui";

export function ArticleDetailsSkeleton(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="hidden lg:col-span-1 lg:flex lg:flex-col lg:items-center lg:gap-4">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <Skeleton key={index} variant="circular" width={40} height={40} />
            ))}
          </div>

          <div className="lg:col-span-6">
            <Skeleton variant="text" width={180} height={14} className="mb-5" />

            <Skeleton variant="text" width="100%" height={38} count={2} className="mb-5" />

            <Skeleton variant="text" width="90%" height={16} count={2} className="mb-6" />

            <Skeleton variant="rounded" width="100%" height={96} className="mb-6" />

            <Skeleton variant="rounded" width="100%" height={360} className="mb-8" />

            <Skeleton variant="text" width="100%" height={16} count={8} />
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <Skeleton variant="rounded" width="100%" height={220} className="mb-6" />

            <Skeleton variant="rounded" width="100%" height={300} />
          </div>
        </div>
      </div>
    </div>
  );
}
