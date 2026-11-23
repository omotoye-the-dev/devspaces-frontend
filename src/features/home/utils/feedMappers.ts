import type { Article } from "@/features/articles/api/articleApi";
import type { Discussion } from "@/features/discussions/types/discussions.types";
import type { ResourceListItem } from "@/features/resources/types/resources.types";
import type {
  ArticleFeedItem,
  TrendingPostItem,
  TrendingDiscussionItem,
  TrendingResourceItem,
} from "@/features/home/types";

/* Map API models to the home-feed view models. */

export function mapApiArticleToFeedItem(art: Article): ArticleFeedItem {
  const authorName =
    art.author?.name || art.author?.userName || art.authorName || "DevSpace Author";
  const authorTitle = art.author?.userName ? `@${art.author.userName}` : "Developer";
  const formattedDate = art.createdAt
    ? new Date(art.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Recently";

  const rawTags = art.tags || art.tagNames || [];
  const variants: ("primary" | "teal" | "neutral" | "outline")[] = [
    "primary",
    "teal",
    "neutral",
    "outline",
  ];
  const tagsList = rawTags.map((t, idx) => ({
    label: t,
    variant: variants[idx % variants.length],
  }));

  return {
    id: art.id,
    author: {
      name: authorName,
      title: authorTitle,
      avatarUrl: art.author?.avatarUrl || undefined,
    },
    date: formattedDate,
    title: art.title || "Untitled Article",
    description: art.excerpt || art.content?.slice(0, 140) || "",
    tags: tagsList,
    likes: art.likeCount ?? art.likes ?? 0,
    comments: art.commentCount ?? art.comments ?? 0,
    readTime: `${art.readingTimeMinutes ?? art.readingTime ?? 4} min read`,
    coverImage: art.coverImageUrl || art.coverImage || "/article-react-tanstack.jpg",
    liked: Boolean(art.liked ?? art.isLiked),
    saved: Boolean(art.saved ?? art.isBookmarked),
  };
}

export function mapTrendingPost(art: Article): TrendingPostItem {
  return {
    kind: "post",
    id: art.id,
    title: art.title || "Untitled",
    excerpt: art.excerpt || art.content?.slice(0, 160) || "",
    coverImage: art.coverImageUrl || art.coverImage || undefined,
    authorName: art.author?.name || art.author?.userName || art.authorName || "DevSpace Author",
    authorAvatar: art.author?.avatarUrl || undefined,
    date: art.createdAt
      ? new Date(art.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Recently",
    tags: art.tags || art.tagNames || [],
    likes: art.likeCount ?? art.likes ?? 0,
    comments: art.commentCount ?? art.comments ?? 0,
    readTime: `${art.readingTimeMinutes ?? art.readingTime ?? 4} min read`,
    liked: Boolean(art.liked ?? art.isLiked),
    saved: Boolean(art.saved ?? art.isBookmarked),
  };
}

export function mapTrendingDiscussion(d: Discussion): TrendingDiscussionItem {
  return {
    kind: "discussion",
    id: d.id,
    title: d.title,
    content: d.content?.slice(0, 200) || "",
    authorName: d.author?.name || d.author?.username || "DevSpace",
    authorAvatar: d.author?.avatarUrl || undefined,
    date: d.createdAt
      ? new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Recently",
    tags: d.tags || [],
    upvotes: d.upvotes ?? d.likeCount ?? 0,
    comments: d.commentsCount ?? 0,
    liked: Boolean(d.isLiked),
  };
}

export function mapTrendingResource(r: ResourceListItem): TrendingResourceItem {
  return {
    kind: "resource",
    id: r.id,
    title: r.title,
    description: r.description?.slice(0, 160) || "",
    category: r.category || "General",
    logoUrl: r.logoUrl || undefined,
    uploaderName: r.uploader?.name || r.uploader?.username || "DevSpace",
    uploaderAvatar: r.uploader?.avatarUrl || undefined,
    date: r.createdAt
      ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Recently",
    tags: r.tags?.map((t) => t.name) || [],
    upvotes: r.upvoteCount ?? 0,
    downloads: r.downloadCount ?? 0,
    saved: Boolean(r.isSavedByMe),
  };
}
