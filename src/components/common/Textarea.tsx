import { useId, type TextareaHTMLAttributes, type JSX } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  fullWidth?: boolean;
  showCount?: boolean;
}

export function Textarea({
  label,
  helperText,
  errorMessage,
  fullWidth = true,
  showCount = false,
  maxLength,
  disabled = false,
  value,
  defaultValue,
  id,
  rows = 4,
  className,
  ...restProps
}: TextareaProps): JSX.Element {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const helperId = `${textareaId}-helper`;
  const errorId = `${textareaId}-error`;

  const hasError = Boolean(errorMessage);

  // Compute character length if controlled or default value is provided
  const currentLength =
    typeof value === "string"
      ? value.length
      : typeof defaultValue === "string"
        ? defaultValue.length
        : 0;

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto")}>
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-medium text-text select-none">
            {label}
          </label>
        )}

        {showCount && maxLength && (
          <span className="text-xs text-text/50 font-mono ml-auto">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
        className={cn(
          "w-full p-3 bg-white text-text font-inter text-sm rounded-md border transition-all duration-150 ease-in-out",
          "placeholder:text-text/40 resize-y min-h-20",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          hasError
            ? "focus:border-red-500 focus:ring-red-500/20"
            : "focus:border-primary focus:ring-primary/20",
          "disabled:bg-background disabled:text-text/40 disabled:cursor-not-allowed disabled:border-border/60",
          className,
        )}
        {...restProps}
      />

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
