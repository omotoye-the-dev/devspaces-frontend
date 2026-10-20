import { useMemo, useState, type JSX, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  HiChevronUp,
  HiOutlineChevronUp,
  HiHeart,
  HiOutlineHeart,
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineShare,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineTrash,
} from "react-icons/hi2";
import { Modal, Avatar, Tag, Button, Textarea, EmptyState } from "@/components/common";
import { cn } from "@/lib/utils/cn";
import { formatTimeAgo } from "@/lib/utils/date";
import { toast } from "@/hooks/useToast";
import { confirmDialog } from "@/hooks/useConfirmDialog";
import type { Discussion } from "@/types/discussions.types";

export interface DiscussionDetailModalProps {
  discussion: Discussion | null;
  open: boolean;
  onClose: () => void;
  onVote: (discussionId: string, direction: "up" | "down") => void;
  onAddComment: (discussionId: string, content: string) => void;
  onVoteComment: (
    discussionId: string,
    commentId: string,
    direction: "up" | "down",
  ) => void;
  onToggleBookmark?: (discussionId: string) => void;
  onTagClick?: (tag: string) => void;
  onDelete?: (discussionId: string) => void;
  onDeleteComment?: (discussionId: string, commentId: string) => void;
  currentUserId?: string;
  isOwner?: boolean;
}

export function DiscussionDetailModal({
  discussion,
  open,
  onClose,
  onVote,
  onAddComment,
  onVoteComment,
  onToggleBookmark,
  onTagClick,
  onDelete,
  onDeleteComment,
  currentUserId,
  isOwner = false,
}: DiscussionDetailModalProps): JSX.Element | null {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Most recent replies first
  const sortedComments = useMemo(
    () =>
      [...(discussion?.comments ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [discussion?.comments],
  );

  if (!discussion) return null;

  const handleCommentSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) {
      toast.error("Please enter a comment before posting");
      return;
    }

    setIsSubmitting(true);
    try {
      onAddComment(discussion.id, trimmed);
      setCommentText("");
      toast.success("Comment posted successfully");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = (): void => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/discussions#${discussion.id}`);
      toast.success("Discussion link copied to clipboard");
    }
  };

  const handleDelete = async (): Promise<void> => {
    const confirmed = await confirmDialog({
      title: "Delete this discussion?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (confirmed) {
      onDelete?.(discussion.id);
    }
  };

  const handleDeleteComment = async (commentId: string): Promise<void> => {
    const confirmed = await confirmDialog({
      title: "Delete this reply?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (confirmed) {
      onDeleteComment?.(discussion.id, commentId);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2 pr-6">
          <span className="text-xs uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
            Question
          </span>
          <Link
            to={`/profile/${discussion.author.id}`}
            className="text-xs text-text/50 font-normal hover:text-primary hover:underline"
          >
            Posted by @{discussion.author.username}
          </Link>
        </div>
      }
      description={
        <span className="flex items-center gap-2 text-xs text-text/50">
          <span>{formatTimeAgo(discussion.createdAt)}</span>
          <span>•</span>
          <span>{discussion.commentsCount} comments</span>
        </span>
      }
    >
      <div className="space-y-6">
        {/* Discussion Question Header & Body */}
        <div className="flex gap-4 items-start">
          {/* Like column */}
          <div className="w-10 flex flex-col items-center bg-background/60 rounded-md p-1 border border-border/60 shrink-0 select-none">
            <button
              type="button"
              onClick={() => onVote(discussion.id, "up")}
              aria-pressed={discussion.isLiked || discussion.userVote === "up"}
              aria-label={discussion.isLiked ? "Unlike discussion" : "Like discussion"}
              title={discussion.isLiked ? "Unlike" : "Like"}
              className={cn(
                "p-1 rounded transition-all duration-150 cursor-pointer active:scale-90",
                discussion.isLiked || discussion.userVote === "up"
                  ? "text-rose-500 bg-rose-50"
                  : "text-text/40 hover:text-rose-500 hover:bg-rose-50/60",
              )}
            >
              {discussion.isLiked || discussion.userVote === "up" ? (
                <HiHeart className="w-5 h-5" />
              ) : (
                <HiOutlineHeart className="w-5 h-5" />
              )}
            </button>

            <span
              className={cn(
                "text-xs font-bold py-1 tabular-nums",
                discussion.isLiked ? "text-rose-500" : "text-text/70",
              )}
            >
              {discussion.likeCount ?? discussion.upvotes}
            </span>
          </div>

          {/* Main Question Content */}
          <div className="flex-1 min-w-0 space-y-3">
            <h1 className="text-xl font-bold text-text leading-snug tracking-tight">
              {discussion.title}
            </h1>

            {/* Author bar */}
            <div className="flex items-center gap-2.5 py-1">
              <Avatar
                size="sm"
                name={discussion.author.name}
                src={discussion.author.avatarUrl}
                href={`/profile/${discussion.author.id}`}
              />
              <div className="text-xs">
                <Link
                  to={`/profile/${discussion.author.id}`}
                  className="font-semibold text-text hover:text-primary hover:underline"
                >
                  {discussion.author.name}
                </Link>
                {discussion.author.role && (
                  <span className="ml-2 text-[11px] text-text/50 font-medium bg-border/40 px-1.5 py-0.5 rounded">
                    {discussion.author.role}
                  </span>
                )}
              </div>
            </div>

            {/* Question Details / Content */}
            <div className="text-sm text-text/80 whitespace-pre-wrap leading-relaxed bg-background/30 p-4 rounded-lg border border-border/50">
              {discussion.content}
            </div>

            {/* Tags row */}
            {discussion.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {discussion.tags.map((tag) => (
                  <Tag
                    key={tag}
                    size="sm"
                    variant="neutral"
                    clickable
                    onClick={() => {
                      onClose();
                      onTagClick?.(tag);
                    }}
                    className="hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    #{tag}
                  </Tag>
                ))}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center gap-2 pt-2 text-xs text-text/60 border-t border-border/40">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-background hover:text-text transition-colors font-medium cursor-pointer"
              >
                <HiOutlineShare className="w-4 h-4 text-text/50" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleBookmark?.(discussion.id)}
                aria-pressed={discussion.isBookmarked}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-150 font-medium cursor-pointer active:scale-95",
                  discussion.isBookmarked
                    ? "text-amber-600 bg-amber-50"
                    : "hover:bg-background hover:text-text",
                )}
              >
                {discussion.isBookmarked ? (
                  <>
                    <HiBookmark className="w-4 h-4" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <HiOutlineBookmark className="w-4 h-4 text-text/50" />
                    <span>Save</span>
                  </>
                )}
              </button>

              {isOwner && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-rose-50 hover:text-rose-600 transition-colors font-medium cursor-pointer ml-auto"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-border" />

        {/* Comments / Answers Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text flex items-center gap-2">
              <HiOutlineChatBubbleLeftEllipsis className="w-5 h-5 text-primary" />
              <span>Responses & Discussion ({discussion.comments.length})</span>
            </h2>
          </div>

          {/* Comment composer */}
          <form onSubmit={handleCommentSubmit} className="space-y-2.5">
            <Textarea
              placeholder="What are your thoughts on this question? Share an answer or ask for clarification..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!commentText.trim() || isSubmitting}
                isLoading={isSubmitting}
              >
                Post Reply
              </Button>
            </div>
          </form>

          {/* Comment List */}
          {discussion.comments.length === 0 ? (
            <div className="py-6 px-4 bg-background/50 rounded-lg border border-dashed border-border text-center">
              <EmptyState
                size="sm"
                title="No replies yet"
                description="Be the first to share your insights and help answer this question!"
              />
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {sortedComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3.5 rounded-lg bg-background/40 border border-border/70 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Avatar
                        size="xs"
                        name={comment.author.name}
                        src={comment.author.avatarUrl}
                        href={`/profile/${comment.author.id}`}
                      />
                      <Link
                        to={`/profile/${comment.author.id}`}
                        className="font-semibold text-text hover:text-primary hover:underline"
                      >
                        {comment.author.name}
                      </Link>
                      <span className="text-text/40 font-mono">@{comment.author.username}</span>
                    </div>
                    <span className="text-text/40">{formatTimeAgo(comment.createdAt)}</span>
                  </div>

                  <p className="text-sm text-text/80 leading-relaxed whitespace-pre-wrap pl-1">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onVoteComment(discussion.id, comment.id, "up")}
                      aria-pressed={comment.isUpvoted}
                      aria-label={comment.isUpvoted ? "Remove upvote" : "Upvote reply"}
                      title={comment.isUpvoted ? "Remove upvote" : "Upvote"}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-bold pl-1.5 pr-2.5 py-1 rounded-full border transition-all duration-150 cursor-pointer active:scale-90 tabular-nums",
                        comment.isUpvoted
                          ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                          : "bg-white text-text/60 border-border hover:border-primary/50 hover:text-primary hover:bg-primary/5",
                      )}
                    >
                      {comment.isUpvoted ? (
                        <HiChevronUp className="w-4 h-4" />
                      ) : (
                        <HiOutlineChevronUp className="w-4 h-4" />
                      )}
                      <span>{comment.upvotes}</span>
                    </button>

                    {onDeleteComment &&
                      Boolean(currentUserId) &&
                      comment.author.id === currentUserId && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteComment(comment.id)}
                          aria-label="Delete reply"
                          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md text-text/50 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer ml-auto"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
