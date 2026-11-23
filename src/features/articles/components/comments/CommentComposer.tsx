import type { FormEvent, JSX } from "react";
import { Avatar, Button } from "@/shared/ui";
import type { AuthUser } from "@/features/auth/types/auth.types";

interface CommentComposerProps {
  /** Signed in (or has a user object): show the form; otherwise a sign-in prompt. */
  canComment: boolean;
  user: AuthUser | null;
  value: string;
  onChange: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent) => void;
}

export function CommentComposer({
  canComment,
  user,
  value,
  onChange,
  isSubmitting,
  onSubmit,
}: CommentComposerProps): JSX.Element {
  return (
    <>
      {canComment ? (
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex gap-3">
            <Avatar
              src={user?.avatarUrl || undefined}
              name={user?.userName || user?.username || user?.firstName || "You"}
              alt={user?.userName || user?.username || user?.firstName || "You"}
              size="sm"
              className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
            />

            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Add a thoughtful comment..."
              rows={3}
              className="min-w-0 flex-1 resize-none rounded-lg border border-gray-200 p-2.5 text-[10px] outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 sm:p-3 sm:text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-1.5 text-[10px] font-medium text-gray-500 transition-colors hover:text-gray-900 sm:text-xs"
            >
              Cancel
            </button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !value.trim()}
              className="text-[10px] sm:text-xs"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center text-[10px] text-gray-600 sm:p-4 sm:text-xs">
          <p>
            Sign in to comment on this article.{" "}
            <a href="/auth/sign-in" className="font-semibold text-blue-600 hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      )}
    </>
  );
}
