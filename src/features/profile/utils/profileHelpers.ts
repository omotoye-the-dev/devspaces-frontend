import type { UserActivityItem } from "@/features/profile/api/user.api";

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
