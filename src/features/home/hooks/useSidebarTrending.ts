import { useQuery } from "@tanstack/react-query";
import type { TrendingDiscussion } from "@/features/articles/components";
import { getDiscussions } from "@/features/discussions/api/discussionApi";
import { queryKeys } from "@/shared/lib/queryKeys";

/** Top 5 discussions for the sidebar widget (signed-in users only). */
export function useSidebarTrending(isAuthenticated: boolean) {
  const { data: trendingSidebarItems = [], isLoading: isSidebarLoading } = useQuery({
    queryKey: queryKeys.discussions.sidebarTrending(),
    enabled: isAuthenticated,
    queryFn: async (): Promise<TrendingDiscussion[]> => {
      try {
        const data = await getDiscussions({ page: 1, pageSize: 5 });
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

        return mapped;
      } catch {
        return [];
      }
    },
  });

  return { trendingSidebarItems, isSidebarLoading };
}
