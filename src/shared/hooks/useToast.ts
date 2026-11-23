import { createContext, useContext, useCallback, type ReactNode } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";
export type ToastPosition =
  "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  duration?: number; // Duration in ms, 0 means do not auto-dismiss
  action?: ToastAction;
  onDismiss?: () => void;
}

export interface ToastItem extends Required<Pick<ToastOptions, "id">> {
  title?: ReactNode;
  description?: ReactNode;
  variant: ToastVariant;
  duration: number;
  action?: ToastAction;
  onDismiss?: () => void;
  createdAt: number;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

let globalAddToast: ((options: ToastOptions) => string) | null = null;
let globalDismissToast: ((id: string) => void) | null = null;

export function setGlobalToastDispatchers(
  add: (options: ToastOptions) => string,
  dismiss: (id: string) => void,
): () => void {
  globalAddToast = add;
  globalDismissToast = dismiss;
  return () => {
    globalAddToast = null;
    globalDismissToast = null;
  };
}

export function useToast(): {
  toast: (options: ToastOptions) => string;
  success: (title: ReactNode, options?: Omit<ToastOptions, "title" | "variant">) => string;
  error: (title: ReactNode, options?: Omit<ToastOptions, "title" | "variant">) => string;
  warning: (title: ReactNode, options?: Omit<ToastOptions, "title" | "variant">) => string;
  info: (title: ReactNode, options?: Omit<ToastOptions, "title" | "variant">) => string;
  dismiss: (id: string) => void;
  clearAll: () => void;
  toasts: ToastItem[];
} {
  const context = useContext(ToastContext);

  const triggerToast = useCallback(
    (options: ToastOptions): string => {
      if (context) {
        return context.addToast(options);
      }
      if (globalAddToast) {
        return globalAddToast(options);
      }
      return "";
    },
    [context],
  );

  const dismiss = useCallback(
    (id: string): void => {
      if (context) {
        context.dismissToast(id);
      } else if (globalDismissToast) {
        globalDismissToast(id);
      }
    },
    [context],
  );

  return {
    toast: triggerToast,
    success: (title, opts) => triggerToast({ ...opts, title, variant: "success" }),
    error: (title, opts) => triggerToast({ ...opts, title, variant: "error" }),
    warning: (title, opts) => triggerToast({ ...opts, title, variant: "warning" }),
    info: (title, opts) => triggerToast({ ...opts, title, variant: "info" }),
    dismiss,
    clearAll: context ? context.clearAll : () => {},
    toasts: context ? context.toasts : [],
  };
}

export const toast = Object.assign(
  (options: ToastOptions): string => {
    if (globalAddToast) {
      return globalAddToast(options);
    }
    return "";
  },
  {
    success: (title: ReactNode, options?: Omit<ToastOptions, "title" | "variant">): string => {
      return toast({ ...options, title, variant: "success" });
    },
    error: (title: ReactNode, options?: Omit<ToastOptions, "title" | "variant">): string => {
      return toast({ ...options, title, variant: "error" });
    },
    warning: (title: ReactNode, options?: Omit<ToastOptions, "title" | "variant">): string => {
      return toast({ ...options, title, variant: "warning" });
    },
    info: (title: ReactNode, options?: Omit<ToastOptions, "title" | "variant">): string => {
      return toast({ ...options, title, variant: "info" });
    },
    dismiss: (id: string): void => {
      globalDismissToast?.(id);
    },
  },
);
