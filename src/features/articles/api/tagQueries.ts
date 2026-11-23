import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/queryKeys";
import { getTags } from "@/features/articles/api/tagApi";

/** Tags change rarely; share one cached list per page size across the app. */
export const tagsQuery = (pageSize: number) =>
  queryOptions({
    queryKey: queryKeys.tags.list(pageSize),
    queryFn: () => getTags({ pageSize }),
    staleTime: 5 * 60_000,
  });

export function useTags(pageSize: number, enabled = true) {
  return useQuery({ ...tagsQuery(pageSize), enabled });
}
