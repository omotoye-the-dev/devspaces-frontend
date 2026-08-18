import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type JSX,
} from "react";
import { cn } from "@/lib/utils/cn";

export type FormInputSize = "sm" | "md" | "lg";

export interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label text displayed above the input */
  label?: string;
  /** Explanatory helper text displayed below the input */
  helperText?: string;
  /** Error message displayed below the input; activates error styling */
  errorMessage?: string;
  /** Alias for errorMessage for compatibility with form libraries */
  error?: string;
  /** Element or icon placed inside the left of the input */
  leftIcon?: ReactNode;
  /** Element or icon placed inside the right of the input */
  rightIcon?: ReactNode;
  /** Size variant of the input */
  inputSize?: FormInputSize;
  /** Whether the input occupies full width of its container */
  fullWidth?: boolean;
  /** Show a toggle button to show/hide password when type="password" */
  showPasswordToggle?: boolean;
}

const sizeStyles: Record<FormInputSize, { input: string; icon: string; toggle: string }> = {
  sm: {
    input: "h-8 text-xs px-2.5 rounded-sm",
    icon: "w-3.5 h-3.5",
    toggle: "w-3.5 h-3.5",
  },
  md: {
    input: "h-10 text-sm px-3.5 rounded-md",
    icon: "w-4 h-4",
    toggle: "w-4 h-4",
  },
  lg: {
    input: "h-12 text-base px-4 rounded-lg",
    icon: "w-5 h-5",
    toggle: "w-5 h-5",
  },
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  {
    label,
    helperText,
    errorMessage,
    error,
    leftIcon,
    rightIcon,
    inputSize = "sm",
    fullWidth = true,
    disabled = false,
    required = false,
    type = "text",
    showPasswordToggle = true,
    id,
    className,
    autoComplete,
    inputMode,
    autoCapitalize,
    spellCheck,
    ...restProps
  },
  ref,
): JSX.Element {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const activeError = errorMessage ?? error;
  const hasError = Boolean(activeError);
  const sizeConfig = sizeStyles[inputSize];

  const isPasswordType = type === "password";
  const effectiveType = isPasswordType ? (isPasswordVisible ? "text" : "password") : type;

  // Defaults for email
  const resolvedAutoComplete =
    autoComplete ?? (type === "email" ? "email" : isPasswordType ? "current-password" : undefined);
  const resolvedInputMode = inputMode ?? (type === "email" ? "email" : undefined);
  const resolvedAutoCapitalize = autoCapitalize ?? (type === "email" ? "none" : undefined);
  const resolvedSpellCheck = spellCheck ?? (type === "email" ? false : undefined);

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto")}>
      {label && (
        <label htmlFor={inputId} className="text-s font-medium text-text select-none">
          {label}
          {/* {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>} */}
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
          ref={ref}
          id={inputId}
          type={effectiveType}
          disabled={disabled}
          required={required}
          autoComplete={resolvedAutoComplete}
          inputMode={resolvedInputMode}
          autoCapitalize={resolvedAutoCapitalize}
          spellCheck={resolvedSpellCheck}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          className={cn(
            "w-full bg-white text-text font-inter border transition-all duration-150 ease-in-out",
            "placeholder:text-text/40",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            hasError
              ? "border-red-500 focus:ring-red-500/20"
              : "focus:border-primary focus:ring-primary/20",
            "disabled:bg-background disabled:text-text/40 disabled:cursor-not-allowed disabled:border-border/60",
            sizeConfig.input,
            leftIcon ? "pl-10" : "pl-3.5",
            isPasswordType && showPasswordToggle
              ? "pr-10"
              : rightIcon
                ? "pr-10"
                : "pr-3.5",
            className,
          )}
          {...restProps}
        />

        {isPasswordType && showPasswordToggle ? (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            disabled={disabled}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className={cn(
              "absolute right-3 flex items-center justify-center text-text/50 hover:text-text focus:outline-none transition-colors",
              sizeConfig.toggle,
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {isPasswordVisible ? (
              // Eye-slash icon
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                />
              </svg>
            ) : (
              // Eye icon
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        ) : rightIcon ? (
          <div
            className={cn(
              "absolute right-3 flex items-center justify-center text-text/50 pointer-events-none",
              sizeConfig.icon,
            )}
          >
            {rightIcon}
          </div>
        ) : null}
      </div>

      {hasError ? (
        <p id={errorId} className="text-xs text-red-500 font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{activeError}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-text/60">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

FormInput.displayName = "FormInput";
