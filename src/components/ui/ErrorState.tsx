import { useState, type ReactNode, type JSX } from "react";
import { Button } from "./Button";
import { cn } from "@/lib/utils/cn";

export type ErrorStateSize = "sm" | "md" | "lg";

export interface ErrorStateProps {
  title?: ReactNode;
  description?: ReactNode;
  error?: unknown;
  icon?: ReactNode;
  onRetry?: () => void;
  action?: ReactNode;
  size?: ErrorStateSize;
  fullPage?: boolean;
  className?: string;
}

const sizeStyles: Record<
  ErrorStateSize,
  {
    container: string;
    iconWrapper: string;
    title: string;
    description: string;
    spacing: string;
  }
> = {
  sm: {
    container: "p-6",
    iconWrapper: "w-10 h-10 text-red-600 bg-red-100",
    title: "text-sm font-semibold",
    description: "text-xs max-w-xs",
    spacing: "gap-3",
  },
  md: {
    container: "p-8 sm:p-10",
    iconWrapper: "w-14 h-14 text-red-600 bg-red-100",
    title: "text-base sm:text-lg font-bold",
    description: "text-xs sm:text-sm max-w-sm",
    spacing: "gap-4",
  },
  lg: {
    container: "p-12 sm:p-16",
    iconWrapper: "w-18 h-18 text-red-600 bg-red-100",
    title: "text-xl sm:text-2xl font-bold",
    description: "text-sm sm:text-base max-w-md",
    spacing: "gap-6",
  },
};

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred while loading this content. Please try again.",
  error,
  icon,
  onRetry,
  action,
  size = "md",
  fullPage = false,
  className,
}: ErrorStateProps): JSX.Element {
  const [showDetails, setShowDetails] = useState(false);
  const currentSize = sizeStyles[size];

  const errorMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : null;

  const defaultIcon = (
    <svg className="w-1/2 h-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center font-inter w-full",
        fullPage ? "min-h-[50vh] sm:min-h-[70vh]" : "",
        currentSize.container,
        currentSize.spacing,
        className,
      )}
    >
      <div
        className={cn(
          "rounded-full flex items-center justify-center shrink-0 shadow-xs",
          currentSize.iconWrapper,
        )}
      >
        {icon ?? defaultIcon}
      </div>

      <div className="space-y-1.5 flex flex-col items-center">
        <h3 className={cn("text-text tracking-tight", currentSize.title)}>{title}</h3>
        {description && (
          <p className={cn("text-text/60 leading-relaxed", currentSize.description)}>
            {description}
          </p>
        )}
      </div>

      {(onRetry || action) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onRetry && (
            <Button
              variant="primary"
              size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"}
              onClick={onRetry}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              }
            >
              Try Again
            </Button>
          )}
          {action}
        </div>
      )}

      {errorMessage && (
        <div className="pt-2 w-full max-w-md">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="text-xs text-text/50 hover:text-text underline cursor-pointer focus-visible:outline-none"
          >
            {showDetails ? "Hide technical error details" : "View technical error details"}
          </button>
          {showDetails && (
            <pre className="mt-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-[11px] font-mono text-left overflow-x-auto whitespace-pre-wrap">
              {errorMessage}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
