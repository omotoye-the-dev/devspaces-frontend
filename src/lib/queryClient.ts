import { QueryClient } from "@tanstack/react-query";

/**
 * Shared cache for server data. Features add their own query hooks
 * (e.g. useArticles) on top of this instead of fetching in useEffect.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
