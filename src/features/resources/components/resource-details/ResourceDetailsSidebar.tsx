import type { JSX } from "react";
import { Avatar, Button } from "@/shared/ui";
import type { ResourceDetail } from "@/features/resources/types/resources.types";

import type { UseResourceDetailsResult } from "@/features/resources/hooks/useResourceDetails";

/** Author card and engagement stats. */
export function ResourceDetailsSidebar({
  details,
  resource,
}: {
  details: UseResourceDetailsResult;
  resource: ResourceDetail;
}): JSX.Element {
  const { navigate } = details;

  return (
    <>
      <aside className="space-y-6">
        {/* Author Profile Card */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-border space-y-4 shadow-2xs text-center">
          <Avatar
            name={resource.uploader?.name || resource.uploader?.username || "Author"}
            src={resource.uploader?.avatarUrl || undefined}
            size="lg"
            className="mx-auto ring-4 ring-primary/10"
          />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text">
              {resource.uploader?.name || resource.uploader?.username || "Contributor"}
            </h3>
            <p className="text-xs text-text/50">@{resource.uploader?.username || "devspace"}</p>
          </div>

          {resource.uploader?.userId && (
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => navigate(`/profile/${resource.uploader.userId}`)}
              className="text-xs font-semibold"
            >
              View Profile
            </Button>
          )}
        </div>

        {/* Resource Engagement Stats Card */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-border space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-text">Resource Statistics</h3>
          <div className="divide-y divide-border text-xs">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-text/60">Community Upvotes</span>
              <span className="font-bold text-text">{resource.upvoteCount}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-text/60">Community Downvotes</span>
              <span className="font-bold text-text">{resource.downvoteCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-text/60">Total Downloads</span>
              <span className="font-bold text-text">{resource.downloadCount}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-text/60">Library Saves</span>
              <span className="font-bold text-text">{resource.saveCount}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-text/60">Modules / Chapters</span>
              <span className="font-bold text-text">{resource.partsCount || 0}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
