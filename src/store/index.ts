/**
 * Single import point for shared app state.
 *
 *   import { useAuthStore } from "@/store";
 *
 * Add new stores as `<name>.store.ts` in this folder and re-export them here.
 * Server data (articles, resources, …) belongs in TanStack Query hooks inside
 * each feature, not in these stores.
 */
export { useAuthStore } from "./auth.store";
