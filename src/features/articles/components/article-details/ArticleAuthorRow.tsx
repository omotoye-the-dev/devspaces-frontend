import type { JSX } from "react";
import { Link } from "react-router-dom";
import { Avatar, Button } from "@/shared/ui";
import { LuClock } from "react-icons/lu";

interface ArticleAuthorRowProps {
  resolvedAuthorAvatar?: string;
  resolvedAuthorName: string;
  resolvedAuthorUsername: string;
  authorProfileUrl: string;
  formattedDate: string;
  readingTime: number;
  isAuthor: boolean;
  targetAuthorId?: string;
  isFollowing: boolean;
  isFollowLoading: boolean;
  onFollowToggle: () => void;
}

export function ArticleAuthorRow({
  resolvedAuthorAvatar,
  resolvedAuthorName,
  resolvedAuthorUsername,
  authorProfileUrl,
  formattedDate,
  readingTime,
  isAuthor,
  targetAuthorId,
  isFollowing,
  isFollowLoading,
  onFollowToggle,
}: ArticleAuthorRowProps): JSX.Element {
  return (
    <div className="my-6 flex items-center justify-between border-y border-gray-200 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          src={resolvedAuthorAvatar}
          alt={resolvedAuthorName}
          href={authorProfileUrl}
          name={resolvedAuthorName}
          size="md"
          className="h-11 w-11"
        />

        <div className="min-w-0">
          <Link
            to={authorProfileUrl}
            className="truncate text-sm font-semibold text-gray-900 hover:text-primary hover:underline"
          >
            {resolvedAuthorUsername}
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{formattedDate}</span>

            <span>·</span>

            <span className="flex items-center gap-1">
              <LuClock className="h-3 w-3" />
              {readingTime} min read
            </span>
          </div>
        </div>
      </div>

      {!isAuthor && targetAuthorId && (
        <Button
          variant={isFollowing ? "secondary" : "primary"}
          size="sm"
          isLoading={isFollowLoading}
          onClick={onFollowToggle}
          className="ml-4 shrink-0 rounded-lg font-semibold"
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}
