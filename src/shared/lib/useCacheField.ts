import { useCallback, type SetStateAction } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

/**
 * `useState`-shaped access to one field of a cached query result.
 *
 * Lets existing optimistic-update code (`setLiked(!liked)`, `setCount((c) => c + 1)`,
 * rollbacks) keep working unchanged while the value lives in the TanStack Query cache,
 * so every view of that query — and a revisit of the page — sees the latest value.
 * Writes before the query has data are ignored, like updates to a not-yet-loaded record.
 */
export function useCacheField<T extends object, K extends keyof T>(
  queryKey: QueryKey,
  data: T | undefined,
  field: K,
  fallback: T[K],
): [T[K], (value: SetStateAction<T[K]>) => void] {
  const queryClient = useQueryClient();
  const setValue = useCallback(
    (value: SetStateAction<T[K]>) => {
      queryClient.setQueryData<T>(queryKey, (old) =>
        old === undefined
          ? old
          : {
              ...old,
              [field]:
                typeof value === "function" ? (value as (prev: T[K]) => T[K])(old[field]) : value,
            },
      );
    },
    [queryClient, queryKey, field],
  );
  return [data === undefined ? fallback : data[field], setValue];
}
