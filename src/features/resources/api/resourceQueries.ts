import { queryClient } from "@/shared/lib/queryClient";
import { queryKeys } from "@/shared/lib/queryKeys";

/** Call after creating, editing or deleting a resource (or its chapters) so cached views refetch. */
export function invalidateResources(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: queryKeys.resources.all });
}
