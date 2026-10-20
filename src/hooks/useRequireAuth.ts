import { useCallback } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/useToast";

/**
 * Guard for interactive actions (like, vote, save, comment, follow...).
 *
 * Returns a function that is true for signed-in users. For guests it shows a
 * "Please log in to ..." toast and returns false so the caller can bail out:
 *
 *   const requireAuth = useRequireAuth();
 *   if (!requireAuth("like this article")) return;
 */
export function useRequireAuth(): (action?: string) => boolean {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useCallback(
    (action?: string): boolean => {
      if (isAuthenticated) return true;
      toast.info(action ? `Please log in to ${action}` : "Please log in to continue");
      return false;
    },
    [isAuthenticated],
  );
}
