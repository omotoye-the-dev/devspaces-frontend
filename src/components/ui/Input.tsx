import { useId, type InputHTMLAttributes, type ReactNode, type JSX } from "react";
import { cn } from "@/lib/utils/cn";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  inputSize?: InputSize;
  fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, { input: string; icon: string }> = {
  sm: {
    input: "h-8 text-xs px-2.5 rounded-sm",
    icon: "w-3.5 h-3.5",
  },
  md: {
    input: "h-10 text-sm px-3.5 rounded-md",
    icon: "w-4 h-4",
  },
  lg: {
    input: "h-12 text-base px-4 rounded-lg",
    icon: "w-5 h-5",
  },
};

export function Input({
  label,
  helperText,
  errorMessage,
  leftIcon,
  rightIcon,
  inputSize = "md",
  fullWidth = true,
  disabled = false,
  id,
  className,
  ...restProps
}: InputProps): JSX.Element {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const hasError = Boolean(errorMessage);
  const sizeConfig = sizeStyles[inputSize];

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto")}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text select-none">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div
            className={cn(
              "absolute left-3 flex items-center justify-center text-text/50 pointer-events-none z-10",
              sizeConfig.icon,
            )}
          >
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          className={cn(
            "w-full bg-white text-text font-inter border transition-all duration-150 ease-in-out",
            "placeholder:text-text/40",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            hasError
              ? "focus:border-red-500 focus:ring-red-500/20"
              : "focus:border-primary focus:ring-primary/20",
            "disabled:bg-background disabled:text-text/40 disabled:cursor-not-allowed disabled:border-border/60",
            sizeConfig.input,
            leftIcon ? "pl-10" : "pl-3.5",
            rightIcon ? "pr-10" : "pr-3.5",
            className,
          )}
          {...restProps}
        />

        {rightIcon && (
          <div
            className={cn(
              "absolute right-3 flex items-center justify-center text-text/50",
              sizeConfig.icon,
            )}
          >
            {rightIcon}
          </div>
        )}
      </div>

      {hasError ? (
        <p id={errorId} className="text-xs text-red-500 font-medium">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-text/60">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
