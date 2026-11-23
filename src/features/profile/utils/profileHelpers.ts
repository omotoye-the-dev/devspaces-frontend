import type { UserActivityItem } from "@/features/profile/api/user.api";
import type { ResourceItem } from "@/features/resources/components/ResourceCard";
import type { ResourceListItem } from "@/features/resources/types/resources.types";

export function describeActivity(item: UserActivityItem): string {
  const type = item.targetType.toLowerCase();
  const article = type === "article" || type === "post";
  const typeLabel = article
    ? "article"
    : type === "resource"
      ? "resource"
      : type === "discussion"
        ? "discussion"
        : type;
  const articleIndicator = article ? "an" : "a";

  switch (item.action) {
    case "Read":
      return `Viewed ${articleIndicator} ${typeLabel}`;
    case "Liked":
      return `Liked ${articleIndicator} ${typeLabel}`;
    case "Saved":
      return `Saved ${articleIndicator} ${typeLabel}`;
    case "Commented":
      return `Commented on ${articleIndicator} ${typeLabel}`;
    case "Published":
      return `Published a new ${typeLabel}`;
    default:
      return `${item.action} ${articleIndicator} ${typeLabel}`;
  }
}

export function getActivityLink(item: UserActivityItem): string | undefined {
  if (!item.targetId) return undefined;
  const type = item.targetType.toLowerCase();
  if (type === "article" || type === "post") return `/articles/${item.targetId}`;
  if (type === "resource") return `/resources/${item.targetId}`;
  return undefined;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function mapToResourceCardItem(item: ResourceListItem): ResourceItem {
  const upvotes = item.upvoteCount ?? 0;
  const downvotes = item.downvoteCount ?? 0;
  const isUpvoted = Boolean(item.isUpvotedByMe);
  const isDownvoted = Boolean(item.isDownvotedByMe);

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    icon: item.logoUrl || undefined,
    url: item.externalUrl || undefined,
    tags: (item.tags || []).map((t) => (typeof t === "string" ? t : t.name)),
    author: {
      id: item.uploader?.userId,
      name: item.uploader?.name || item.uploader?.username || "DevSpace Contributor",
      avatarUrl: item.uploader?.avatarUrl || undefined,
    },
    updatedAt: formatDate(item.createdAt),
    upvotesCount: upvotes,
    downvotesCount: downvotes,
    isUpvoted,
    isDownvoted,
    isBookmarked: item.isSavedByMe,
  };
}

/** Returns the first candidate that is (or parses as) a number, else 0. */
export function getStatNumber(...candidates: unknown[]): number {
  for (const val of candidates) {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val === "string" && val.trim() !== "") {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return 0;
}
