/**
 * Shared normalizer for SignalR live-hub broadcasts on resource entities.
 *
 * The backend may use different casing / pluralisation across versions.
 * This file is the single source of truth for that mapping, so every
 * consumer (ResourceCard, ResourceDetailsPage, …) stays consistent.
 */

export interface ResourceCounts {
  upvoteCount?: number;
  downvoteCount?: number;
  viewCount?: number;
  saveCount?: number;
  downloadCount?: number;
}

/** Returns `v` when it is a finite number, otherwise `undefined`. */
const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;

/**
 * Parses a raw SignalR broadcast payload into a `ResourceCounts` object.
 *
 * - Only returns counts (never personal flags like `isUpvotedByMe`) so
 *   caller-owned optimistic state is never silently overwritten.
 * - Returns `null` when the payload carries no recognisable count fields.
 * - Keys with `undefined` values are stripped so they never overwrite
 *   existing values in a spread merge.
 */
export function normalizeResourceUpdate(raw: unknown): ResourceCounts | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;

  const out: ResourceCounts = {
    upvoteCount: num(d.upvotes ?? d.upvoteCount ?? d.upvotesCount),
    downvoteCount: num(d.downvotes ?? d.downvoteCount ?? d.downvotesCount),
    viewCount: num(d.views ?? d.viewCount),
    saveCount: num(d.saves ?? d.saveCount),
    downloadCount: num(d.downloads ?? d.downloadCount),
  };

  // Drop undefined keys so they never overwrite real values in a spread
  const cleaned = Object.fromEntries(
    Object.entries(out).filter(([, v]) => v !== undefined),
  ) as ResourceCounts;

  // If nothing was recognised, return null so callers can bail early
  if (Object.keys(cleaned).length === 0) return null;

  return cleaned;
}
