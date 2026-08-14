import { useId, type SelectHTMLAttributes, type ReactNode, type JSX } from "react";
import { cn } from "@/lib/utils/cn";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  options?: SelectOption[];
  selectSize?: SelectSize;
  fullWidth?: boolean;
  placeholder?: string;
  leftIcon?: ReactNode;
  children?: ReactNode;
}

const sizeStyles: Record<SelectSize, { select: string; icon: string }> = {
  sm: {
    select: "h-8 text-xs pl-2.5 pr-8 rounded-sm",
    icon: "w-3.5 h-3.5",
  },
  md: {
    select: "h-10 text-sm pl-3.5 pr-10 rounded-md",
    icon: "w-4 h-4",
  },
  lg: {
    select: "h-12 text-base pl-4 pr-12 rounded-lg",
    icon: "w-5 h-5",
  },
};

export function Select({
  label,
  helperText,
  errorMessage,
  options,
  selectSize = "md",
  fullWidth = true,
  placeholder,
  leftIcon,
  disabled = false,
  id,
  className,
  children,
  ...restProps
}: SelectProps): JSX.Element {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;

  const hasError = Boolean(errorMessage);
  const sizeConfig = sizeStyles[selectSize];

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto")}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-text select-none">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div
            className={cn(
              "absolute left-3 flex items-center justify-center text-text/50 pointer-events-none",
              sizeConfig.icon,
            )}
          >
            {leftIcon}
          </div>
        )}

        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          className={cn(
            "w-full bg-white text-text font-inter border appearance-none transition-all duration-150 ease-in-out cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            hasError
              ? "focus:border-red-500 focus:ring-red-500/20"
              : "focus:border-primary focus:ring-primary/20",
            "disabled:bg-background disabled:text-text/40 disabled:cursor-not-allowed disabled:border-border/60",
            sizeConfig.select,
            leftIcon && "pl-10",
            className,
          )}
          {...restProps}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {options
            ? options.map((opt) => (
                <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {/* Custom Chevron Indicator */}
        <div
          className={cn(
            "absolute right-3 flex items-center justify-center text-text/50 pointer-events-none",
            sizeConfig.icon,
          )}
          aria-hidden="true"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
