import { create } from "zustand";
import type { AuthUser } from "@/types/auth.types";

const getDisplayName = (user?: AuthUser | null): string => {
  if (!user) return "User";

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;

  if (user.userName) return user.userName;
  if (user.username) return user.username;
  if (user.email) return user.email.split("@")[0];

  return "User";
};

const syncStoredProfile = (user?: AuthUser | null) => {
  if (typeof window === "undefined") return;

  if (user?.avatarUrl) {
    localStorage.setItem("devspace_avatar", user.avatarUrl);
  } else {
    localStorage.removeItem("devspace_avatar");
  }

  localStorage.setItem("devspace_user_name", getDisplayName(user));
};

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user?: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("devspace_token") : null,
  isAuthenticated:
    typeof window !== "undefined" ? Boolean(localStorage.getItem("devspace_token")) : false,
  setAuth: (token, user) => {
    localStorage.setItem("devspace_token", token);
    const normalizedUser = user ?? null;
    syncStoredProfile(normalizedUser);
    set({ token, user: normalizedUser, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("devspace_token");
    localStorage.removeItem("devspace_avatar");
    localStorage.removeItem("devspace_user_name");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
