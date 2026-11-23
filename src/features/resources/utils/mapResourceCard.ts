import type { ResourceItem } from "@/features/resources/components/ResourceCard";
import type { ResourceListItem } from "@/features/resources/types/resources.types";
import { formatDate } from "@/features/resources/utils/resourceFormat";

/** Maps an API resource list item to the props ResourceCard expects. */
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
