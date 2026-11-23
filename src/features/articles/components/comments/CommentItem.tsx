import type { FormEvent, JSX } from "react";
import { Avatar, Button } from "@/shared/ui";
import { cn } from "@/shared/lib/utils/cn";
import type { AuthUser } from "@/features/auth/types/auth.types";
import {
  extractLeadingMention,
  formatCommentTimeAgo,
  type DisplayComment,
} from "@/features/articles/utils/commentTree";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { HiOutlineTrash } from "react-icons/hi2";

/** One comment plus its reply form and (recursively) its open replies. */
export interface CommentItemProps {
  comment: DisplayComment;
  depth: number;
  threadRootUsername?: string;
  replyingTo: string | null;
  replyText: string;
  isReplying: boolean;
  currentUser: AuthUser | null;
  onReplyClick: (comment: DisplayComment) => void;
  onReplyTextChange: (value: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (event: FormEvent, parentId: string) => Promise<void>;
  onToggleReplies: (commentId: string) => void;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

export function CommentItem({
  comment,
  depth,
  threadRootUsername,
  replyingTo,
  replyText,
  isReplying,
  currentUser,
  onReplyClick,
  onReplyTextChange,
  onCancelReply,
  onSubmitReply,
  onToggleReplies,
  onLike,
  onDelete,
}: CommentItemProps): JSX.Element {
  const indentation = Math.min(depth, 4) * 16;

  const displayName =
    comment.user?.username?.trim() ||
    comment.user?.userName?.trim() ||
    comment.user?.name?.trim() ||
    comment.userId ||
    "User";

  const displayAvatar = comment.user?.avatarUrl || comment.user?.avatar || undefined;

  const { mentionUsername, displayMessage } =
    depth > 0
      ? extractLeadingMention(comment.message)
      : { mentionUsername: null, displayMessage: comment.message };
  const repliedToUsername = depth > 0 ? (mentionUsername ?? threadRootUsername ?? null) : null;

  const isOwnComment = Boolean(
    currentUser?.id &&
    (currentUser.id === comment.userId || (comment.user?.id && currentUser.id === comment.user.id)),
  );

  const currentUserName =
    currentUser?.userName || currentUser?.username || currentUser?.firstName || "You";

  const currentUserAvatar = currentUser?.avatarUrl || undefined;

  const effectiveRepliesCount =
    comment.replies && comment.replies.length > 0
      ? comment.replies.length
      : (comment.repliesCount ?? 0);

  return (
    <div
      className="space-y-3"
      style={{
        marginLeft: indentation > 0 ? `${indentation}px` : undefined,
      }}
    >
      {/* COMMENT */}
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar
          src={displayAvatar}
          name={displayName}
          alt={displayName}
          size="sm"
          className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
        />

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* User information */}
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="wrap-break-word text-[10px] font-semibold text-gray-900 sm:text-xs">
              {displayName}
            </p>

            {isOwnComment && (
              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-medium text-blue-600 sm:text-[9px]">
                You
              </span>
            )}

            <span className="text-[9px] text-gray-400 sm:text-[10px]">
              {formatCommentTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Replied-to indicator */}
          {repliedToUsername && (
            <p className="mb-1 text-[9px] text-gray-400 sm:text-[10px]">
              Replied to <span className="font-semibold text-gray-600">@{repliedToUsername}</span>
            </p>
          )}

          {/* Message */}
          <p className="mb-2.5 wrap-break-words text-[10px] leading-relaxed text-gray-700 sm:text-xs">
            {displayMessage}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Like */}
            <button
              type="button"
              disabled={comment.isLiking}
              onClick={() => onLike(comment.id)}
              aria-label={comment.liked ? "Unlike comment" : "Like comment"}
              className={cn(
                "group flex items-center gap-1.5 text-[9px] transition-colors sm:text-[10px]",
                comment.liked ? "font-semibold text-blue-600" : "text-gray-500 hover:text-blue-600",
                comment.isLiking && "cursor-not-allowed opacity-60",
              )}
            >
              {comment.liked ? (
                <AiFillLike className="h-3.5 w-3.5 text-blue-600 transition-transform active:scale-125" />
              ) : (
                <AiOutlineLike className="h-3.5 w-3.5 transition-transform group-hover:text-blue-600 active:scale-125" />
              )}

              <span>
                {(comment.likeCount ?? 0) > 0 ? (
                  <>
                    <span>{comment.likeCount}</span>{" "}
                    <span>{comment.likeCount === 1 ? "Like" : "Likes"}</span>
                  </>
                ) : (
                  "Like"
                )}
              </span>
            </button>

            {/* Reply */}
            <button
              type="button"
              onClick={() => onReplyClick(comment)}
              className="text-[9px] font-medium text-gray-500 transition-colors hover:text-blue-600 sm:text-[10px]"
            >
              Reply
            </button>

            {/* Delete (own comments only) */}
            {isOwnComment && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                aria-label="Delete comment"
                className="flex items-center gap-1 text-[9px] font-medium text-gray-500 transition-colors hover:text-rose-600 sm:text-[10px]"
              >
                <HiOutlineTrash className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* View/Hide Replies Toggle */}
          {effectiveRepliesCount > 0 && (
            <button
              type="button"
              onClick={() => onToggleReplies(comment.id)}
              className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline sm:text-[10px]"
            >
              {comment.isLoadingReplies ? (
                <span>Loading replies...</span>
              ) : comment.isRepliesOpen ? (
                <span>Hide {effectiveRepliesCount === 1 ? "reply" : "replies"}</span>
              ) : (
                <span>
                  View {effectiveRepliesCount} {effectiveRepliesCount === 1 ? "reply" : "replies"}
                </span>
              )}
            </button>
          )}

          {/* REPLY INPUT */}
          {replyingTo === comment.id && (
            <form
              onSubmit={(event) => onSubmitReply(event, comment.id)}
              className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-2.5 sm:p-3"
            >
              <div className="flex gap-2.5">
                <Avatar
                  src={currentUserAvatar}
                  name={currentUserName}
                  alt={currentUserName}
                  size="sm"
                  className="h-7 w-7 shrink-0 sm:h-8 sm:w-8"
                />

                <textarea
                  value={replyText}
                  onChange={(event) => onReplyTextChange(event.target.value)}
                  placeholder={`Reply to @${displayName}...`}
                  rows={2}
                  autoFocus
                  className="min-w-0 flex-1 resize-none rounded-lg border border-gray-200 bg-white p-2 text-[10px] text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 sm:text-xs"
                />
              </div>

              <div className="mt-2 flex justify-end gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={onCancelReply}
                  className="px-2.5 py-1.5 text-[9px] font-medium text-gray-500 transition-colors hover:text-gray-900 sm:text-[10px]"
                >
                  Cancel
                </button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isReplying || !replyText.trim()}
                  className="text-[9px] sm:text-[10px]"
                >
                  {isReplying ? "Replying..." : "Reply"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* NESTED REPLIES */}
      {comment.isRepliesOpen && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4 border-l border-gray-200 pl-3 sm:pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              threadRootUsername={
                comment.user?.username?.trim() ||
                comment.user?.userName?.trim() ||
                comment.user?.name?.trim() ||
                displayName
              }
              replyingTo={replyingTo}
              replyText={replyText}
              isReplying={isReplying}
              currentUser={currentUser}
              onReplyClick={onReplyClick}
              onReplyTextChange={onReplyTextChange}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
              onToggleReplies={onToggleReplies}
              onLike={onLike}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
