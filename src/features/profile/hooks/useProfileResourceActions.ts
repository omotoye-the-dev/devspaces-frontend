import { useCallback, type Dispatch, type MouseEvent, type SetStateAction } from "react";
import { toast } from "@/shared/hooks/useToast";
import { getApiErrorMessage } from "@/shared/lib/utils/apiError";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";
import { voteResource, saveResource } from "@/features/resources/api/resources.api";
import { calculateVoteTransition, applyVoteResponse } from "@/features/resources/utils/voteHelper";
import type { ResourceCounts } from "@/features/resources/utils/liveUpdate";
import type { ResourceListItem } from "@/features/resources/types/resources.types";

/** Optimistic upvote / downvote / bookmark handlers for the profile's resource list. */
export function useProfileResourceActions(
  resources: ResourceListItem[],
  setResources: Dispatch<SetStateAction<ResourceListItem[]>>,
) {
  const handleLiveResourceCounts = useCallback(
    (id: string, counts: ResourceCounts): void => {
      setResources((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                upvoteCount: counts.upvoteCount ?? r.upvoteCount,
                downvoteCount: counts.downvoteCount ?? r.downvoteCount,
                saveCount: counts.saveCount ?? r.saveCount,
              }
            : r,
        ),
      );
    },
    [setResources],
  );

  const requireAuth = useRequireAuth();

  // Upvote (0) and downvote (1) share the same optimistic update / reconcile / rollback flow.
  const handleResourceVote = async (
    resId: string,
    e: MouseEvent<HTMLButtonElement>,
    voteType: 0 | 1,
    authAction: string,
    errorMessage: string,
  ): Promise<void> => {
    if (!requireAuth(authAction)) return;
    e.stopPropagation();
    const target = resources.find((r) => r.id === resId);
    if (!target) return;

    const currentVoteState = {
      upvoteCount: target.upvoteCount ?? 0,
      downvoteCount: target.downvoteCount ?? 0,
      isUpvotedByMe: Boolean(target.isUpvotedByMe),
      isDownvotedByMe: Boolean(target.isDownvotedByMe),
    };

    const transition = calculateVoteTransition(currentVoteState, voteType);
    if (!transition.allowed) {
      if (transition.reason) {
        toast.info(transition.reason);
      }
      return;
    }

    // Optimistic update
    setResources((prev) =>
      prev.map((r) =>
        r.id === resId
          ? {
              ...r,
              isUpvotedByMe: transition.optimisticState.isUpvotedByMe,
              isDownvotedByMe: transition.optimisticState.isDownvotedByMe,
              upvoteCount: transition.optimisticState.upvoteCount,
              downvoteCount: transition.optimisticState.downvoteCount,
            }
          : r,
      ),
    );

    try {
      const res = await voteResource(resId, voteType);
      const reconciled = applyVoteResponse(transition.optimisticState, res.data);
      setResources((prev) =>
        prev.map((r) =>
          r.id === resId
            ? {
                ...r,
                isUpvotedByMe: reconciled.isUpvotedByMe,
                isDownvotedByMe: reconciled.isDownvotedByMe,
                upvoteCount: reconciled.upvoteCount,
                downvoteCount: reconciled.downvoteCount,
              }
            : r,
        ),
      );
    } catch (err: unknown) {
      // Rollback
      setResources((prev) =>
        prev.map((r) =>
          r.id === resId
            ? {
                ...r,
                isUpvotedByMe: currentVoteState.isUpvotedByMe,
                isDownvotedByMe: currentVoteState.isDownvotedByMe,
                upvoteCount: currentVoteState.upvoteCount,
                downvoteCount: currentVoteState.downvoteCount,
              }
            : r,
        ),
      );
      toast.error(getApiErrorMessage(err, errorMessage));
    }
  };

  const handleResourceUpvote = (resId: string, e: MouseEvent<HTMLButtonElement>): Promise<void> =>
    handleResourceVote(resId, e, 0, "upvote this resource", "Failed to record vote");

  const handleResourceDownvote = (resId: string, e: MouseEvent<HTMLButtonElement>): Promise<void> =>
    handleResourceVote(resId, e, 1, "downvote this resource", "Failed to record downvote");

  const handleResourceBookmark = async (
    resId: string,
    e: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    if (!requireAuth("save this resource")) return;
    e.stopPropagation();
    const target = resources.find((r) => r.id === resId);
    if (!target) return;

    const nextSaved = !target.isSavedByMe;

    setResources((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, isSavedByMe: nextSaved } : r)),
    );

    try {
      await saveResource(resId, nextSaved);
      toast.success(nextSaved ? "Saved to your bookmarks" : "Removed from bookmarks");
    } catch (err: unknown) {
      setResources((prev) =>
        prev.map((r) => (r.id === resId ? { ...r, isSavedByMe: !nextSaved } : r)),
      );
      toast.error(getApiErrorMessage(err, "Failed to update saved status"));
    }
  };

  return {
    handleLiveResourceCounts,
    handleResourceUpvote,
    handleResourceDownvote,
    handleResourceBookmark,
  };
}
