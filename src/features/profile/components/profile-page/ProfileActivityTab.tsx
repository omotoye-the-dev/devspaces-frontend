import type { JSX } from "react";
import { Link } from "react-router-dom";
import { EmptyState, Skeleton } from "@/shared/ui";
import { formatTimeAgo } from "@/shared/lib/utils/date";
import type { UserActivityItem } from "@/features/profile/api/user.api";
import { describeActivity, getActivityLink } from "@/features/profile/utils/profileHelpers";
import { FiActivity } from "react-icons/fi";

interface ProfileActivityTabProps {
  isActivityLoading: boolean;
  visibleActivities: UserActivityItem[];
  isOwnProfile: boolean;
  displayName: string;
}

export function ProfileActivityTab({
  isActivityLoading,
  visibleActivities,
  isOwnProfile,
  displayName,
}: ProfileActivityTabProps): JSX.Element {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-bold text-text">Recent Activity</h3>

      {isActivityLoading ? (
        <div className="space-y-3 divide-y divide-border/60">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="pt-3 space-y-2">
              <Skeleton variant="text" width="60%" height={14} />
              <Skeleton variant="text" width={80} height={11} />
            </div>
          ))}
        </div>
      ) : visibleActivities.length === 0 ? (
        <EmptyState
          size="sm"
          icon={<FiActivity className="w-5 h-5 text-text/40" />}
          title="No activity yet"
          description={
            isOwnProfile
              ? "Your reads, likes, and comments will show up here."
              : `${displayName} hasn't had any recent activity.`
          }
        />
      ) : (
        <div className="space-y-3 divide-y divide-border/60">
          {visibleActivities.map((item) => {
            const href = getActivityLink(item);
            return (
              <div key={item.id} className="pt-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs text-text/60">
                    {describeActivity(item)}:{" "}
                    {href ? (
                      <Link
                        to={href}
                        className="font-semibold text-text hover:text-primary hover:underline"
                      >
                        {item.targetTitle}
                      </Link>
                    ) : (
                      <span className="font-semibold text-text">{item.targetTitle}</span>
                    )}
                  </p>
                  <p className="text-[11px] text-text/40">{formatTimeAgo(item.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
