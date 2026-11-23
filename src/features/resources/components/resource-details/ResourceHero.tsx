import type { JSX } from "react";
import { FiCalendar } from "react-icons/fi";
import { Avatar } from "@/shared/ui";
import type { ResourceDetail } from "@/features/resources/types/resources.types";
import { formatDate } from "@/features/resources/utils/resourceFormat";

/** Category, title, description and meta line. */
export function ResourceHero({
  resource,
  isOwner,
}: {
  resource: ResourceDetail;
  isOwner: boolean;
}): JSX.Element {
  return (
    <>
      <header className="space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            {resource.category}
          </span>

          <span className="flex items-center gap-1.5 text-xs text-text/50">
            <FiCalendar className="w-3.5 h-3.5" />
            <span>Published {formatDate(resource.createdAt)}</span>
          </span>
        </div>

        <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-text tracking-tight leading-tight">
          {resource.title}
        </h1>

        {/* Author Details row */}
        <div className="flex items-center gap-3 pt-1">
          <Avatar
            name={resource.uploader?.name || resource.uploader?.username || "Author"}
            src={resource.uploader?.avatarUrl || undefined}
            size="md"
            className="ring-2 ring-border shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-text truncate">
              {resource.uploader?.name || resource.uploader?.username || "DevSpace Contributor"}
            </p>
            <p className="text-xs text-text/50 truncate">
              @{resource.uploader?.username || "devspace"}
              {isOwner && " • (You)"}
            </p>
          </div>
        </div>
      </header>
    </>
  );
}
