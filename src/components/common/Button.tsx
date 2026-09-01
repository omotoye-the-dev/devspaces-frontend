import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  JSX,
  MouseEvent,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "teal" | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

type BaseHTMLAttributes = Omit<
  ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>,
  "onClick"
>;

export interface ButtonProps extends BaseHTMLAttributes {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  href?: string;
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
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
  href,
  target,
  rel,
  onClick,
  ...restProps
}: ButtonProps): JSX.Element {
  const isButtonDisabled = disabled || isLoading;

  const buttonClasses = cn(
    "inline-flex items-center justify-center font-medium font-inter select-none transition-all duration-150 ease-in-out cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "active:scale-[0.98]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100",
    isButtonDisabled && "opacity-50 cursor-not-allowed pointer-events-none active:scale-100",
    fullWidth ? "w-full" : "w-auto",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  const content = (
    <>
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
    </>
  );

  const handleClick = (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (isButtonDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  if (href) {
    const isInternal = href.startsWith("/") && !href.startsWith("//") && target !== "_blank";

    if (isInternal) {
      return (
        <Link
          to={href}
          className={buttonClasses}
          aria-busy={isLoading}
          aria-disabled={isButtonDisabled || undefined}
          tabIndex={isButtonDisabled ? -1 : undefined}
          onClick={handleClick}
          {...(restProps as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">)}
        >
          {content}
        </Link>
      );
    }

    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? (rel ?? "noopener noreferrer") : rel}
        className={buttonClasses}
        aria-busy={isLoading}
        aria-disabled={isButtonDisabled || undefined}
        tabIndex={isButtonDisabled ? -1 : undefined}
        onClick={handleClick}
        {...(restProps as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={isButtonDisabled}
      aria-busy={isLoading}
      className={buttonClasses}
      onClick={handleClick}
      {...(restProps as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
}

