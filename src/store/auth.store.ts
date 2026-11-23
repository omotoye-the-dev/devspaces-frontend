import { create } from "zustand";
import type { AuthUser } from "@/types/auth.types";
import { STORAGE_KEYS, storage } from "@/lib/storage";

const getDisplayName = (user?: AuthUser | null): string => {
  if (!user) return "User";

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;

  if (user.userName) return user.userName;
  if (user.username) return user.username;
  if (user.email) return user.email.split("@")[0];

  return "User";
};

/** Persists the user plus the derived avatar/display-name keys other screens read. */
const persistUser = (user: AuthUser | null): void => {
  if (user) {
    storage.setJSON(STORAGE_KEYS.user, user);
  } else {
    storage.remove(STORAGE_KEYS.user);
  }

  if (user?.avatarUrl) {
    storage.set(STORAGE_KEYS.avatar, user.avatarUrl);
  } else {
    storage.remove(STORAGE_KEYS.avatar);
  }

  storage.set(STORAGE_KEYS.userName, getDisplayName(user));
};

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (
    token: string,
    refreshTokenOrUser?: string | AuthUser | null,
    maybeUser?: AuthUser,
  ) => void;
  setUser: (user: AuthUser | null) => void;
  setTokens: (token: string, refreshToken?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storage.getJSON<AuthUser | null>(STORAGE_KEYS.user, null),
  token: storage.get(STORAGE_KEYS.token),
  refreshToken: storage.get(STORAGE_KEYS.refreshToken),
  isAuthenticated: Boolean(storage.get(STORAGE_KEYS.token)),

  setAuth: (token, refreshTokenOrUser, maybeUser) => {
    let refreshToken: string | null = null;
    let user: AuthUser | null = null;

    if (typeof refreshTokenOrUser === "string") {
      refreshToken = refreshTokenOrUser;
      user = maybeUser ?? null;
    } else if (refreshTokenOrUser && typeof refreshTokenOrUser === "object") {
      user = refreshTokenOrUser;
    }

    storage.set(STORAGE_KEYS.token, token);
    if (refreshToken) storage.set(STORAGE_KEYS.refreshToken, refreshToken);
    persistUser(user);

    set({
      token,
      refreshToken: refreshToken ?? storage.get(STORAGE_KEYS.refreshToken),
      user,
      isAuthenticated: true,
    });
  },

  setUser: (user) => {
    persistUser(user);
    set({ user });
  },

  setTokens: (token, refreshToken) => {
    storage.set(STORAGE_KEYS.token, token);
    if (refreshToken) storage.set(STORAGE_KEYS.refreshToken, refreshToken);
    set((state) => ({
      token,
      refreshToken: refreshToken ?? state.refreshToken,
      isAuthenticated: true,
    }));
  },

  logout: () => {
    storage.remove(
      STORAGE_KEYS.token,
      STORAGE_KEYS.refreshToken,
      STORAGE_KEYS.avatar,
      STORAGE_KEYS.user,
      STORAGE_KEYS.userName,
    );
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },
}));
