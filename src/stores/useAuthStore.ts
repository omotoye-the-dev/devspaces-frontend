import { create } from "zustand";
import type { AuthUser } from "@/types/auth.types";

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
    set({ token, user: user ?? null, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("devspace_token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
