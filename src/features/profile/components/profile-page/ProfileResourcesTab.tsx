import { useMemo, type JSX, type MouseEvent } from "react";
import { Button, EmptyState, Skeleton } from "@/shared/ui";
import { ResourceCard, type ResourceItem } from "@/features/resources/components/ResourceCard";
import { ResourceLiveSync } from "@/features/resources/components/ResourceLiveSync";
import type { ResourceCounts } from "@/features/resources/utils/liveUpdate";
import type { ResourceListItem } from "@/features/resources/types/resources.types";
import { mapToResourceCardItem } from "@/features/resources/utils/mapResourceCard";
import { FiFolder, FiArrowUp, FiArrowDown, FiDownload } from "react-icons/fi";

type ResourceAction = (resId: string, e: MouseEvent<HTMLButtonElement>) => Promise<void>;

interface ProfileResourcesTabProps {
  isLoading: boolean;
  resources: ResourceListItem[];
  isOwnProfile: boolean;
  displayName: string;
  onLiveCounts: (id: string, counts: ResourceCounts) => void;
  onResourceClick: (item: ResourceItem) => void;
  onUpvote: ResourceAction;
  onDownvote: ResourceAction;
  onBookmark: ResourceAction;
}

/** Engagement stats strip plus the grid of resources this user shared. */
export function ProfileResourcesTab({
  isLoading,
  resources,
  isOwnProfile,
  displayName,
  onLiveCounts,
  onResourceClick,
  onUpvote,
  onDownvote,
  onBookmark,
}: ProfileResourcesTabProps): JSX.Element {
  const totalResourceUpvotes = useMemo(
    () => resources.reduce((acc, r) => acc + (r.upvoteCount || 0), 0),
    [resources],
  );
  const totalResourceDownloads = useMemo(
    () => resources.reduce((acc, r) => acc + (r.downloadCount || 0), 0),
    [resources],
  );
  const totalResourceDownvotes = useMemo(
    () => resources.reduce((acc, r) => acc + (r.downvoteCount || 0), 0),
    [resources],
  );

  return (
    <div className="space-y-5">
      {/* Resource Engagement Stats Strip */}
      {!isLoading && resources.length > 0 && (
        <div className="grid grid-cols-3 gap-3 p-3.5 sm:p-4 bg-white border border-border/80 rounded-2xl shadow-2xs text-center">
          <div className="flex flex-col items-center justify-center gap-0.5">
            <div className="flex items-center gap-1.5 text-xs text-text/60 font-medium">
              <FiArrowUp className="w-3.5 h-3.5 text-primary" />
              <span>Upvotes</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-text">{totalResourceUpvotes}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5 border-x border-border/70">
            <div className="flex items-center gap-1.5 text-xs text-text/60 font-medium">
              <FiDownload className="w-3.5 h-3.5 text-blue-600" />
              <span>Downloads</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-text">{totalResourceDownloads}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5">
            <div className="flex items-center gap-1.5 text-xs text-text/60 font-medium">
              <FiArrowDown className="w-3.5 h-3.5 text-rose-500" />
              <span>Downvotes</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-text">{totalResourceDownvotes}</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((item) => (
            <div key={item.id}>
              <ResourceLiveSync id={item.id} onCounts={onLiveCounts} />
              <ResourceCard
                resource={mapToResourceCardItem(item)}
                onClick={onResourceClick}
                onUpvote={onUpvote}
                onDownvote={onDownvote}
                onBookmark={onBookmark}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FiFolder className="w-10 h-10 text-text/30" />}
          title="No resources shared yet"
          description={
            isOwnProfile
              ? "You haven't shared any developer resources yet."
              : `${displayName} hasn't shared any developer resources yet.`
          }
          bordered
          action={
            isOwnProfile ? (
              <Button href="/resources" size="sm" className="rounded-xl">
                Browse & Add Resources
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
