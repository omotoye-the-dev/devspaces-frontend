import axios from "axios";
import { API_BASE_URL } from "./endpoints";
import { getApiErrorMessage } from "@/lib/utils/apiError";

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

// Response interceptor to ensure API response error message is attached to error.message
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const extractedMessage = getApiErrorMessage(error);
      if (extractedMessage) {
        error.message = extractedMessage;
      }
    }
    return Promise.reject(error);
  },
);

