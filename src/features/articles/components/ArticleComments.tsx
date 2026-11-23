import type { JSX } from "react";
import { Skeleton } from "@/shared/ui";
import { countAllComments } from "@/features/articles/utils/commentTree";
import { useArticleComments } from "@/features/articles/hooks/useArticleComments";
import { CommentItem } from "./comments/CommentItem";
import { CommentComposer } from "./comments/CommentComposer";

export type { CommentUser, DisplayComment } from "@/features/articles/utils/commentTree";

export interface ArticleCommentsProps {
  articleId: string;
  initialCommentCount?: number;
  onCommentCountChange?: (count: number) => void;
}

export function ArticleComments({
  articleId,
  initialCommentCount,
  onCommentCountChange,
}: ArticleCommentsProps): JSX.Element {
  const {
    comments,
    isLoading,
    newComment,
    setNewComment,
    isSubmitting,
    replyingTo,
    replyText,
    setReplyText,
    isReplying,
    user,
    isAuthenticated,
    handleSubmitComment,
    handleReplyClick,
    handleSubmitReply,
    handleToggleReplies,
    handleLikeComment,
    handleDeleteComment,
    cancelReply,
  } = useArticleComments(articleId, onCommentCountChange);

  return (
    <div className="w-full space-y-5 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-900 sm:text-sm">
          Comments (
          {isLoading
            ? (initialCommentCount ?? countAllComments(comments))
            : countAllComments(comments)}
          )
        </h2>
      </div>

      <CommentComposer
        canComment={Boolean(user || isAuthenticated)}
        user={user}
        value={newComment}
        onChange={setNewComment}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitComment}
      />

      <div className="space-y-5">
        {isLoading ? (
          Array.from({
            length: 3,
          }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <Skeleton variant="circular" width={36} height={36} />

              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton variant="text" width={120} height={14} />

                <Skeleton variant="text" width="100%" height={12} count={2} />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            <p className="text-[10px] sm:text-xs">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              replyingTo={replyingTo}
              replyText={replyText}
              isReplying={isReplying}
              currentUser={user}
              onReplyClick={handleReplyClick}
              onReplyTextChange={setReplyText}
              onCancelReply={cancelReply}
              onSubmitReply={handleSubmitReply}
              onToggleReplies={handleToggleReplies}
              onLike={handleLikeComment}
              onDelete={(id) => void handleDeleteComment(id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ArticleComments;
