/**
 * Shared normalizer for SignalR live-hub broadcasts on discussion entities.
 *
 * The backend may use different casing / pluralisation across versions.
 * This file is the single source of truth for that mapping so every
 * consumer (DiscussionCard, DiscussionDetailModal, …) stays consistent.
 *
 * Only count fields are returned — never personal flags like `isLiked` —
 * so caller-owned optimistic state is never silently overwritten.
 */

export interface DiscussionCounts {
  likeCount?: number;
  commentsCount?: number;
  saveCount?: number;
}

export interface DiscussionCommentCounts {
  upvotes?: number;
}

/** Returns `v` when it is a finite number, otherwise `undefined`. */
const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;

/**
 * Parses a raw SignalR broadcast payload into a `DiscussionCounts` object.
 * Returns `null` when the payload carries no recognisable count fields.
 */
export function normalizeDiscussionUpdate(raw: unknown): DiscussionCounts | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;

  const out: DiscussionCounts = {
    likeCount: num(d.likeCount ?? d.likes ?? d.likesCount),
    commentsCount: num(d.commentsCount ?? d.replyCount ?? d.comments),
    saveCount: num(d.saveCount ?? d.saves),
  };

  const cleaned = Object.fromEntries(
    Object.entries(out).filter(([, v]) => v !== undefined),
  ) as DiscussionCounts;

  if (Object.keys(cleaned).length === 0) return null;
  return cleaned;
}

/**
 * Parses a raw SignalR broadcast payload into a `DiscussionCommentCounts` object.
 * Returns `null` when the payload carries no recognisable count fields.
 */
export function normalizeDiscussionCommentUpdate(
  raw: unknown,
): DiscussionCommentCounts | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;

  const out: DiscussionCommentCounts = {
    upvotes: num(d.upvotes ?? d.upvoteCount),
  };

  const cleaned = Object.fromEntries(
    Object.entries(out).filter(([, v]) => v !== undefined),
  ) as DiscussionCommentCounts;

  if (Object.keys(cleaned).length === 0) return null;
  return cleaned;
}
