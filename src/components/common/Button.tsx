import type { ButtonHTMLAttributes, ReactNode, JSX } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "teal" | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-dark focus-visible:ring-primary active:bg-primary-dark",
  secondary:
    "bg-background text-text border border-border shadow-xs hover:bg-border/40 focus-visible:ring-primary active:bg-border/60",
  outline:
    "bg-transparent text-primary border border-primary/40 hover:bg-primary/10 hover:border-primary focus-visible:ring-primary active:bg-primary/20",
  ghost:
    "bg-transparent text-text hover:bg-border/50 focus-visible:ring-primary active:bg-border/70",
  teal: "bg-teal text-white shadow-sm hover:opacity-90 focus-visible:ring-teal active:opacity-95",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500 active:bg-red-800",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-sm",
  md: "h-10 px-4 text-sm gap-2 rounded-md",
  lg: "h-12 px-6 text-base gap-2.5 rounded-lg",
  icon: "h-10 px-6 text-sm gap-2 rounded-md",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  className,
  children,
  type = "button",
  ...restProps
}: ButtonProps): JSX.Element {
  const isButtonDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isButtonDisabled}
      aria-busy={isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium font-inter select-none transition-all duration-150 ease-in-out cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100",
        fullWidth ? "w-full" : "w-auto",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...restProps}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon && (
          <span className="inline-flex shrink-0 items-center justify-center">{leftIcon}</span>
        )
      )}

      {children && <span>{children}</span>}

      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0 items-center justify-center">{rightIcon}</span>
      )}
    </button>
  );
}
