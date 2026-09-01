import axios from "axios";
import { API_BASE_URL } from "./endpoints";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/useToast";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token if present
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("devspace_token") : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle session expiration (401) and format error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        useAuthStore.getState().logout();
        toast.error("Session expired. Please sign in again.");
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth/sign-in";
        }
      } else {
        const extractedMessage = getApiErrorMessage(error);
        if (extractedMessage) {
          error.message = extractedMessage;
        }
      }
    }
    return Promise.reject(error);
  },
);
