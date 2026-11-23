import { getFeedArticles } from "@/features/articles/api/articleApi";
import type { Tag } from "@/features/articles/api/tagApi";
import type { ArticleResult, TagResult } from "@/features/search/types";

export const MAX_PER_SECTION = 3;

export function filterArticles(
  items: Awaited<ReturnType<typeof getFeedArticles>>["data"],
  q: string,
): ArticleResult[] {
  const lower = q.toLowerCase();
  return items
    .filter(
      (a) => a.title?.toLowerCase().includes(lower) || a.excerpt?.toLowerCase().includes(lower),
    )
    .slice(0, MAX_PER_SECTION)
    .map((a) => ({
      kind: "article" as const,
      id: a.id,
      title: a.title || "Untitled",
      excerpt: a.excerpt ?? undefined,
      authorName: a.authorName ?? (a.author as { name?: string } | null)?.name,
    }));
}

export function filterTags(tags: Tag[], q: string): TagResult[] {
  const lower = q.toLowerCase();
  return tags
    .filter((t) => t.name.toLowerCase().includes(lower))
    .slice(0, MAX_PER_SECTION)
    .map((t) => ({ kind: "tag" as const, name: t.name, slug: t.slug, usageCount: t.usageCount }));
}

// ─── Component ─────────────────────────────────────────────────────────────────
