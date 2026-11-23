import { queryClient } from "@/shared/lib/queryClient";
import { queryKeys } from "@/shared/lib/queryKeys";

/** Call after creating, editing or deleting an article so cached views refetch. */
export function invalidateArticles(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
}

/** Drop a deleted article from the cache so Back can't briefly show it again. */
export function removeArticleFromCache(id: string): void {
  queryClient.removeQueries({ queryKey: queryKeys.articles.detail(id) });
}
