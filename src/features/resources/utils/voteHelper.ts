import type { VoteAction, VoteResourceResponseData } from "@/types/resources.types";

export interface VoteState {
  upvoteCount: number;
  downvoteCount: number;
  isUpvotedByMe: boolean;
  isDownvotedByMe: boolean;
}

export interface VoteTransitionResult {
  allowed: boolean;
  reason?: string;
  action?: VoteAction;
  optimisticState: VoteState;
}

/**
 * Calculates optimistic state transition for voting on a resource.
 * Rules:
 * - Upvote is action 0
 * - Downvote is action 1
 * - Sending the action integer again resets/removes the vote.
 * - If user is upvoted and wants to downvote, user must click upvote again to remove it first.
 * - If user is downvoted and wants to upvote, user must click downvote again to remove it first.
 */
export function calculateVoteTransition(
  current: VoteState,
  targetAction: VoteAction,
): VoteTransitionResult {
  if (targetAction === 0) {
    // Attempting Upvote
    if (current.isDownvotedByMe) {
      return {
        allowed: false,
        reason: "Please remove your downvote before upvoting.",
        optimisticState: current,
      };
    }

    const nextIsUpvoted = !current.isUpvotedByMe;
    const delta = nextIsUpvoted ? 1 : -1;

    return {
      allowed: true,
      action: 0,
      optimisticState: {
        ...current,
        isUpvotedByMe: nextIsUpvoted,
        upvoteCount: Math.max(0, current.upvoteCount + delta),
      },
    };
  }

  // Attempting Downvote (action === 1)
  if (current.isUpvotedByMe) {
    return {
      allowed: false,
      reason: "Please remove your upvote before downvoting.",
      optimisticState: current,
    };
  }

  const nextIsDownvoted = !current.isDownvotedByMe;
  const delta = nextIsDownvoted ? 1 : -1;

  return {
    allowed: true,
    action: 1,
    optimisticState: {
      ...current,
      isDownvotedByMe: nextIsDownvoted,
      downvoteCount: Math.max(0, current.downvoteCount + delta),
    },
  };
}

/**
 * Merges server response into vote state, safely falling back to optimistic values
 * if the backend does not return specific fields.
 */
export function applyVoteResponse(
  fallbackState: VoteState,
  resData?: VoteResourceResponseData | null,
): VoteState {
  if (!resData) {
    return fallbackState;
  }

  const upvoteCount =
    typeof resData.upvoteCount === "number"
      ? resData.upvoteCount
      : typeof resData.upvotesCount === "number"
        ? resData.upvotesCount
        : fallbackState.upvoteCount;

  const downvoteCount =
    typeof resData.downvoteCount === "number"
      ? resData.downvoteCount
      : typeof resData.downvotesCount === "number"
        ? resData.downvotesCount
        : fallbackState.downvoteCount;

  const isUpvotedByMe =
    typeof resData.isUpvoted === "boolean"
      ? resData.isUpvoted
      : typeof resData.isUpvotedByMe === "boolean"
        ? resData.isUpvotedByMe
        : fallbackState.isUpvotedByMe;

  const isDownvotedByMe =
    typeof resData.isDownvoted === "boolean"
      ? resData.isDownvoted
      : typeof resData.isDownvotedByMe === "boolean"
        ? resData.isDownvotedByMe
        : fallbackState.isDownvotedByMe;

  return {
    upvoteCount,
    downvoteCount,
    isUpvotedByMe,
    isDownvotedByMe,
  };
}
