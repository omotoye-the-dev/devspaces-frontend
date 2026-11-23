import { useState, type JSX, type MouseEvent } from "react";
import { cn } from "@/shared/lib/utils/cn";
import { AiFillHeart, AiOutlineComment, AiOutlineHeart, AiOutlineShareAlt } from "react-icons/ai";
import { HiOutlineEllipsisHorizontal } from "react-icons/hi2";
import { LuBookmark, LuBookmarkCheck } from "react-icons/lu";

interface ArticleActionRailProps {
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
  isAuthor: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/** Sticky desktop rail: like, comments, bookmark, share and the "more" menu. */
export function ArticleActionRail({
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
  isAuthor,
  onEdit,
  onDelete,
}: ArticleActionRailProps): JSX.Element {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <aside className="hidden shrink-0 lg:flex">
      <div className="sticky top-8 z-20 flex h-fit flex-col items-center gap-1 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
        {/* Like */}
        <button
          type="button"
          onClick={onLike}
          disabled={isLiking}
          title={isLiked ? "Unlike" : "Like"}
          aria-label={isLiked ? "Unlike article" : "Like article"}
          className={cn(
            "flex w-14 flex-col items-center gap-1 rounded-lg p-2.5 transition",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isLiked
              ? "bg-red-50 text-red-500"
              : "text-gray-400 hover:bg-gray-50 hover:text-red-500",
          )}
        >
          {isLiked ? <AiFillHeart className="h-5 w-5" /> : <AiOutlineHeart className="h-5 w-5" />}

          <span
            className={cn("text-[11px] font-semibold", isLiked ? "text-red-600" : "text-gray-500")}
          >
            {likeCount}
          </span>
        </button>

        {/* Comments */}
        <button
          type="button"
          onClick={onToggleComments}
          title={showComments ? "Hide comments" : "Show comments"}
          aria-label={showComments ? "Hide comments" : "Show comments"}
          className={cn(
            "flex w-14 flex-col items-center gap-1 rounded-lg p-2.5 transition",
            showComments
              ? "bg-primary/10 text-primary"
              : "text-gray-400 hover:bg-gray-50 hover:text-primary",
          )}
        >
          <AiOutlineComment className="h-5 w-5" />

          <span
            className={cn(
              "text-[11px] font-semibold",
              showComments ? "text-primary" : "text-gray-500",
            )}
          >
            {commentCount}
          </span>
        </button>

        {/* Bookmark */}
        <button
          type="button"
          onClick={onBookmark}
          disabled={isSaving}
          title={isBookmarked ? "Remove bookmark" : "Bookmark"}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
          className={cn(
            "flex w-14 flex-col items-center gap-1 rounded-lg p-2.5 transition",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isBookmarked
              ? "bg-primary/10 text-primary"
              : "text-gray-400 hover:bg-gray-50 hover:text-primary",
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
          title="Share"
          aria-label="Share article"
          className="flex w-14 flex-col items-center gap-1 rounded-lg p-2.5 text-gray-400 transition hover:bg-gray-50 hover:text-primary"
        >
          <AiOutlineShareAlt className="h-5 w-5" />
        </button>

        {/* More */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMoreMenu((previous) => !previous)}
            title="More options"
            aria-label="More article options"
            className="flex w-14 flex-col items-center gap-1 rounded-lg p-2.5 text-gray-400 transition hover:bg-gray-50 hover:text-primary"
          >
            <HiOutlineEllipsisHorizontal className="h-5 w-5" />
          </button>

          {showMoreMenu && (
            <div className="absolute left-16 top-0 z-50 min-w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
              {isAuthor ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onEdit();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit Article
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);

                      onDelete();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete Article
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowMoreMenu(false)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Report Article
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMoreMenu(false)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Block Author
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
