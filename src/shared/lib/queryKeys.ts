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
  profile: {
    all: ["profile"] as const,
    me: () => ["profile", "me"] as const,
    byId: (id: string) => ["profile", "user", id] as const,
  },
} as const;
