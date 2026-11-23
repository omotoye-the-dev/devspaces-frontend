import type { Article } from "@/features/articles/api/articleApi";

export interface DisplayArticle {
  id: string;
  authorId?: string;
  title: string;
  excerpt: string;
  tagNames: string[];
  category?: string;
  coverImage?: string;
  status?: "draft" | "published" | "scheduled" | "archived";
  authorInfo?: string[];
  authorName?: string;
  authoruserName?: string;
  authorAvatar?: string;
  authorRole?: string;
  createdAt: string;
  readTimeMinutes?: number;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export function getArticleAuthor(art: Article): {
  name: string;
  userName: string;
  avatar?: string;
} {
  if (art.author && typeof art.author === "object") {
    const a = art.author;
    const name = (a.userName && a.userName.trim()) || (a.name && a.name.trim());
    if (name) {
      return {
        name,
        avatar: a.avatarUrl || undefined,
        userName: a.userName as string,
      };
    }
  }
  if (typeof art.authorName === "string" && art.authorName.trim()) {
    return {
      name: art.authorName.trim(),
      avatar: undefined,
      userName: "" as string,
    };
  }
  return { name: "DevSpace Author", userName: "devspace", avatar: undefined };
}

export function mapArticle(art: Article): DisplayArticle {
  const { name: authoruserName, avatar: authorAvatar } = getArticleAuthor(art);
  const raw = art as unknown as Record<string, unknown>;

  const likeCount =
    typeof raw.likeCount === "number"
      ? raw.likeCount
      : typeof raw.likes === "number"
        ? raw.likes
        : typeof art.likeCount === "number"
          ? art.likeCount
          : typeof art.likes === "number"
            ? art.likes
            : 0;

  const isLiked =
    typeof raw.liked === "boolean"
      ? raw.liked
      : typeof raw.isLiked === "boolean"
        ? raw.isLiked
        : Boolean(art.liked ?? art.isLiked);

  const commentCount =
    typeof raw.commentCount === "number"
      ? raw.commentCount
      : typeof raw.comments === "number"
        ? raw.comments
        : typeof art.commentCount === "number"
          ? art.commentCount
          : typeof art.comments === "number"
            ? art.comments
            : 0;

  const isSaved = Boolean(
    raw.saved ?? raw.isBookmarked ?? raw.isSaved ?? art.saved ?? art.isBookmarked,
  );

  return {
    id: art.id,
    authorId: art.author?.id || art.authorId,
    title: art.title || "Untitled Article",
    excerpt: art.excerpt || art.content || "",
    tagNames: (() => {
      const rawTags = (art.tags && art.tags.length > 0 ? art.tags : art.tagNames) || [];
      return rawTags
        .map((t: unknown) =>
          typeof t === "string"
            ? t
            : t && typeof t === "object" && "name" in t
              ? String((t as { name: unknown }).name)
              : "",
        )
        .filter(Boolean);
    })(),
    category: art.series || "General",
    coverImage: art.coverImageUrl || art.coverImage,
    status: art.status as DisplayArticle["status"],
    authoruserName,
    authorAvatar: authorAvatar || (art as unknown as { authorAvatar?: string }).authorAvatar,
    authorRole: undefined,
    createdAt: art.createdAt || new Date().toISOString(),
    readTimeMinutes:
      art.readingTimeMinutes ??
      art.readingTime ??
      Math.max(1, Math.ceil((art.content?.length || 0) / 500)),
    likes: likeCount,
    comments: commentCount,
    isLiked,
    isBookmarked: isSaved,
  };
}
