import axios from "axios";

export interface ApiErrorResponseBody {
  message?: string;
  Message?: string;
  msg?: string;
  title?: string;
  Title?: string;
  error?: string | { message?: string; error?: string; msg?: string } | string[];
  Error?: string | { message?: string; error?: string; msg?: string } | string[];
  errors?: string[] | Record<string, string[] | string | unknown>;
  Errors?: string[] | Record<string, string[] | string | unknown>;
  detail?: string | { msg?: string; message?: string }[] | Record<string, unknown>;
  Detail?: string;
  description?: string;
  Description?: string;
  [key: string]: unknown;
}

/**
 * Safely extracts a human-readable error message from an unknown API error response.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected error occurred. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;

    // 1. Direct string response body
    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    // 2. Structured JSON response body
    if (data && typeof data === "object") {
      const errObj = data as ApiErrorResponseBody;

      // Primary 'message' / 'Message' / 'msg'
      if (typeof errObj.message === "string" && errObj.message.trim().length > 0) {
        return errObj.message;
      }
      if (typeof errObj.Message === "string" && errObj.Message.trim().length > 0) {
        return errObj.Message;
      }
      if (typeof errObj.msg === "string" && errObj.msg.trim().length > 0) {
        return errObj.msg;
      }

      // 'error' / 'Error' field (string or nested object)
      const errVal = errObj.error ?? errObj.Error;
      if (typeof errVal === "string" && errVal.trim().length > 0) {
        return errVal;
      }
      if (errVal && typeof errVal === "object" && !Array.isArray(errVal)) {
        const nestedMsg = errVal.message ?? errVal.error ?? errVal.msg;
        if (typeof nestedMsg === "string" && nestedMsg.trim().length > 0) {
          return nestedMsg;
        }
      }

      // 'detail' / 'Detail' (FastAPI / RFC 7807 Problem Details)
      const detailVal = errObj.detail ?? errObj.Detail;
      if (typeof detailVal === "string" && detailVal.trim().length > 0) {
        return detailVal;
      }
      if (Array.isArray(detailVal) && detailVal.length > 0) {
        const detailMsgs = detailVal
          .map((item) =>
            typeof item === "object" && item
              ? item.msg ?? item.message ?? String(item)
              : String(item),
          )
          .filter(Boolean);
        if (detailMsgs.length > 0) {
          return detailMsgs.join(", ");
        }
      }

      // 'errors' / 'Errors' field (array of strings or key-value validation dictionary)
      const errorsVal = errObj.errors ?? errObj.Errors;
      if (Array.isArray(errorsVal) && errorsVal.length > 0) {
        return errorsVal.map(String).join(", ");
      }
      if (errorsVal && typeof errorsVal === "object") {
        const messages: string[] = [];
        for (const value of Object.values(errorsVal)) {
          if (Array.isArray(value)) {
            messages.push(...value.map(String));
          } else if (typeof value === "string") {
            messages.push(value);
          } else if (value) {
            messages.push(String(value));
          }
        }
        if (messages.length > 0) {
          return messages.join(", ");
        }
      }

      // 'description' / 'Description'
      const descVal = errObj.description ?? errObj.Description;
      if (typeof descVal === "string" && descVal.trim().length > 0) {
        return descVal;
      }

      // 'title' / 'Title'
      const titleVal = errObj.title ?? errObj.Title;
      if (typeof titleVal === "string" && titleVal.trim().length > 0) {
        return titleVal;
      }
    }

    // 3. Fallback to status text or network error message on AxiosError
    if (error.response?.statusText && error.response.statusText.trim().length > 0) {
      return `${error.response.statusText} (${error.response.status})`;
    }

    if (error.message && error.message.trim().length > 0) {
      return error.message;
    }
  }

  // Standard JavaScript Error object
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  // Primitive string error
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return fallbackMessage;
}

