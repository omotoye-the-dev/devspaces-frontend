import axios from "axios";

interface ApiErrorResponseBody {
  message?: string;
  title?: string;
  error?: string;
  errors?: string[] | Record<string, string[] | string>;
}

/**
 * Safely extracts a human-readable error message from an unknown API error.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected error occurred. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (data && typeof data === "object") {
      const errObj = data as ApiErrorResponseBody;

      if (typeof errObj.message === "string" && errObj.message.trim().length > 0) {
        return errObj.message;
      }

      if (typeof errObj.error === "string" && errObj.error.trim().length > 0) {
        return errObj.error;
      }

      if (Array.isArray(errObj.errors) && errObj.errors.length > 0) {
        return errObj.errors.join(", ");
      }

      if (errObj.errors && typeof errObj.errors === "object") {
        const messages: string[] = [];
        for (const value of Object.values(errObj.errors)) {
          if (Array.isArray(value)) {
            messages.push(...value);
          } else if (typeof value === "string") {
            messages.push(value);
          }
        }
        if (messages.length > 0) {
          return messages.join(", ");
        }
      }

      if (typeof errObj.title === "string" && errObj.title.trim().length > 0) {
        return errObj.title;
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
