import type { JSX, MouseEvent } from "react";
import { cn } from "@/shared/lib/utils/cn";
import { AiFillHeart, AiOutlineComment, AiOutlineHeart, AiOutlineShareAlt } from "react-icons/ai";
import { LuBookmark, LuBookmarkCheck } from "react-icons/lu";

interface MobileActionBarProps {
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  onLike: (event?: MouseEvent) => void;
  showComments: boolean;
  commentCount: number;
  onToggleComments: () => void;
  isBookmarked: boolean;
  isSaving: boolean;
  onBookmark: (event?: MouseEvent) => void;
  onShare: () => void;
}

/** Inline action buttons shown below the article on small screens. */
export function MobileActionBar({
  isLiked,
  likeCount,
  isLiking,
  onLike,
  showComments,
  commentCount,
  onToggleComments,
  isBookmarked,
  isSaving,
  onBookmark,
  onShare,
}: MobileActionBarProps): JSX.Element {
  return (
    <div className="mt-8 flex items-center gap-2 overflow-x-auto border-t border-gray-200 py-4 lg:hidden">
      {/* Like */}
      <button
        type="button"
        onClick={onLike}
        disabled={isLiking}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 transition",
          isLiked
            ? "border-red-200 bg-red-50 text-red-500"
            : "border-gray-200 text-gray-600 hover:bg-gray-50",
        )}
      >
        {isLiked ? <AiFillHeart className="h-5 w-5" /> : <AiOutlineHeart className="h-5 w-5" />}

        <span className="text-sm font-semibold">{likeCount}</span>
      </button>

      {/* Comments */}
      <button
        type="button"
        onClick={onToggleComments}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 transition",
          showComments
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-gray-200 text-gray-600 hover:bg-gray-50",
        )}
      >
        <AiOutlineComment className="h-5 w-5" />

        <span className="text-sm font-semibold">{commentCount}</span>
      </button>

      {/* Bookmark */}
      <button
        type="button"
        onClick={onBookmark}
        disabled={isSaving}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 transition",
          isBookmarked
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-gray-200 text-gray-600 hover:bg-gray-50",
        )}
      >
        {isBookmarked ? (
          <LuBookmarkCheck className="h-5 w-5" />
        ) : (
          <LuBookmark className="h-5 w-5" />
        )}
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={onShare}
        className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 transition hover:bg-gray-50"
      >
        <AiOutlineShareAlt className="h-5 w-5" />
      </button>
    </div>
  );
}
