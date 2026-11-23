/**
 * Every TanStack Query key in the app, in one place.
 *
 * Server data lives in the query cache (not in Zustand). Keys are hierarchical, so
 * invalidating a prefix refreshes everything under it, e.g.
 *   queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
 */
export const queryKeys = {
  tags: {
    all: ["tags"] as const,
    list: (pageSize: number) => ["tags", "list", { pageSize }] as const,
  },
  articles: {
    all: ["articles"] as const,
    latest: () => ["articles", "latest"] as const,
    detail: (id: string) => ["articles", "detail", id] as const,
  },
  resources: {
    all: ["resources"] as const,
    popular: () => ["resources", "popular"] as const,
  },
  discussions: {
    all: ["discussions"] as const,
    sidebarTrending: () => ["discussions", "sidebar-trending"] as const,
  },
  profile: {
    all: ["profile"] as const,
    me: () => ["profile", "me"] as const,
    byId: (id: string) => ["profile", "user", id] as const,
  },
} as const;
