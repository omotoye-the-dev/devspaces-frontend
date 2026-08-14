import { useState, useEffect, useCallback, type ReactNode, type JSX } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import {
  ToastContext,
  setGlobalToastDispatchers,
  type ToastItem,
  type ToastOptions,
  type ToastPosition,
  type ToastVariant,
} from "@/hooks/useToast";

export type {
  ToastItem,
  ToastOptions,
  ToastPosition,
  ToastVariant,
  ToastAction,
} from "@/hooks/useToast";

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: JSX.Element; iconBg: string }
> = {
  success: {
    container: "border-emerald-200 bg-white text-text",
    iconBg: "bg-emerald-100 text-emerald-600",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    container: "border-red-200 bg-white text-text",
    iconBg: "bg-red-100 text-red-600",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
  },
  warning: {
    container: "border-amber-200 bg-white text-text",
    iconBg: "bg-amber-100 text-amber-600",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  },
  info: {
    container: "border-primary/20 bg-white text-text",
    iconBg: "bg-primary/10 text-primary",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
};

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ toast: item, onDismiss }: ToastProps): JSX.Element {
  const currentVariant = variantStyles[item.variant];

  useEffect(() => {
    if (item.duration <= 0) return;

    const timer = setTimeout(() => {
      item.onDismiss?.();
      onDismiss(item.id);
    }, item.duration);

    return () => clearTimeout(timer);
  }, [item, onDismiss]);

  const handleManualDismiss = (): void => {
    item.onDismiss?.();
    onDismiss(item.id);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "pointer-events-auto flex items-start gap-3 w-full max-w-sm p-4 rounded-lg border shadow-lg font-inter",
        "animate-in slide-in-from-right-5 fade-in duration-200 transition-all",
        currentVariant.container,
      )}
    >
      <div
        className={cn(
          "shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
          currentVariant.iconBg,
        )}
      >
        {currentVariant.icon}
      </div>

      <div className="flex-1 min-w-0 pt-0.5 space-y-1">
        {item.title && (
          <h4 className="text-sm font-semibold text-text leading-snug">{item.title}</h4>
        )}
        {item.description && (
          <p className="text-xs text-text/70 leading-relaxed">{item.description}</p>
        )}
        {item.action && (
          <div className="pt-1.5">
            <button
              type="button"
              onClick={() => {
                item.action?.onClick();
                handleManualDismiss();
              }}
              className="text-xs font-semibold text-primary hover:text-primary-dark underline cursor-pointer focus-visible:outline-none"
            >
              {item.action.label}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleManualDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-md text-text/40 hover:text-text hover:bg-black/5 transition-colors cursor-pointer focus-visible:outline-none"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export interface ToastProviderProps {
  position?: ToastPosition;
  children: ReactNode;
}

const positionStyles: Record<ToastPosition, string> = {
  "top-right": "top-4 right-4 items-end",
  "top-left": "top-4 left-4 items-start",
  "bottom-right": "bottom-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

export function ToastProvider({
  position = "bottom-right",
  children,
}: ToastProviderProps): JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = options.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastItem = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant ?? "info",
      duration: options.duration ?? 4000,
      action: options.action,
      onDismiss: options.onDismiss,
      createdAt: Date.now(),
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback((): void => {
    setToasts([]);
  }, []);

  useEffect(() => {
    const cleanup = setGlobalToastDispatchers(addToast, dismissToast);
    return cleanup;
  }, [addToast, dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast, clearAll }}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            aria-live="polite"
            className={cn(
              "fixed z-50 flex flex-col gap-2.5 pointer-events-none max-w-full p-2",
              positionStyles[position],
            )}
          >
            {toasts.map((t) => (
              <Toast key={t.id} toast={t} onDismiss={dismissToast} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
