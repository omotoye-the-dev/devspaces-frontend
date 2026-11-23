import { useEffect, useState } from "react";
import type { TrendingDiscussion } from "@/features/articles/components";
import { getDiscussions } from "@/features/discussions/api/discussionApi";

/** Top 5 discussions for the sidebar widget (signed-in users only). */
export function useSidebarTrending(isAuthenticated: boolean) {
  const [trendingSidebarItems, setTrendingSidebarItems] = useState<TrendingDiscussion[]>([]);
  const [isSidebarLoading, setIsSidebarLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    async function loadSidebarTrending(): Promise<void> {
      try {
        const data = await getDiscussions({ page: 1, pageSize: 5 });
        if (!active) return;

        const mapped: TrendingDiscussion[] = data.slice(0, 5).map((item, i) => {
          const colors = [
            "bg-violet-500",
            "bg-emerald-500",
            "bg-sky-500",
            "bg-amber-500",
            "bg-rose-500",
          ];

          const author = item.author?.name || item.author?.username || "Author";

          return {
            id: item.id,
            title: item.title,
            author,
            username: item.author?.username,
            avatarUrl: item.author?.avatarUrl,
            timeAgo: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "Recently",
            replies: item.commentsCount ?? 0,
            avatarColor: colors[i % colors.length],
          };
        });

        setTrendingSidebarItems(mapped);
      } catch {
        if (active) {
          setTrendingSidebarItems([]);
        }
      } finally {
        if (active) setIsSidebarLoading(false);
      }
    }
    void loadSidebarTrending();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  return { trendingSidebarItems, isSidebarLoading };
}
