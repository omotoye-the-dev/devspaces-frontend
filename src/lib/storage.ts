/**
 * Single place for every browser-storage key and read/write in the app.
 * All access is SSR-safe and never throws (private mode, blocked storage, bad JSON).
 */

export const STORAGE_KEYS = {
  token: "devspace_token",
  refreshToken: "devspace_refresh_token",
  user: "devspace_user",
  userName: "devspace_user_name",
  avatar: "devspace_avatar",
  recentSearches: "devspace_recent_searches",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

const hasStorage = (): boolean => typeof window !== "undefined" && !!window.localStorage;

export const storage = {
  get(key: StorageKey): string | null {
    if (!hasStorage()) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key: StorageKey, value: string): void {
    if (!hasStorage()) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage full or blocked: ignore, the app still works in-memory.
    }
  },

  remove(...keys: StorageKey[]): void {
    if (!hasStorage()) return;
    try {
      keys.forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // ignore
    }
  },

  getJSON<T>(key: StorageKey, fallback: T): T {
    const raw = storage.get(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  setJSON(key: StorageKey, value: unknown): void {
    storage.set(key, JSON.stringify(value));
  },
};
