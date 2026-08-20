import {
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type ClipboardEvent,
  type JSX,
} from "react";
import { cn } from "@/lib/utils/cn";

export interface OtpInputProps {
  /** Length of the OTP (default: 6) */
  length?: number;
  /** Current concatenated OTP string */
  value?: string;
  /** Callback fired whenever the OTP value updates */
  onChange: (otp: string) => void;
  /** Callback fired when all digits are populated */
  onComplete?: (otp: string) => void;
  /** Error message to display below input */
  error?: string;
  /** Label text for the field */
  label?: string;
  /** Sub-label / helper hint */
  subLabel?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function OtpInput({
  length = 6,
  value = "",
  onChange,
  onComplete,
  error,
  label,
  subLabel,
  disabled = false,
}: OtpInputProps): JSX.Element {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Derive digits directly from props to avoid cascading renders
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const updateOtp = (newDigits: string[]) => {
    const combined = newDigits.join("");
    onChange(combined);
    if (combined.length === length) {
      onComplete?.(combined);
    }
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, ""); // digits only
    if (!rawVal) {
      const updated = [...digits];
      updated[index] = "";
      updateOtp(updated);
      return;
    }

    const singleDigit = rawVal[rawVal.length - 1];
    const updated = [...digits];
    updated[index] = singleDigit;
    updateOtp(updated);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const updated = [...digits];
        updated[index - 1] = "";
        updateOtp(updated);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pastedData) return;

    const updated = Array(length).fill("");
    for (let i = 0; i < pastedData.length; i++) {
      updated[i] = pastedData[i];
    }
    updateOtp(updated);

    const nextFocusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {(label || subLabel) && (
        <div className="flex items-center justify-between text-xs font-medium text-text select-none">
          {label && <span>{label}</span>}
          {subLabel && <span className="text-[11px] text-text/50">{subLabel}</span>}
        </div>
      )}

      <div className="flex gap-2 justify-between items-center w-full" onPaste={handlePaste}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            disabled={disabled}
            value={digits[index] || ""}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={cn(
              "w-11 h-12 text-center text-lg font-bold font-mono rounded-md border text-text bg-white transition-all focus:outline-none focus:ring-2",
              "disabled:bg-background disabled:text-text/40 disabled:cursor-not-allowed",
              error
                ? "border-red-500 focus:ring-red-500/20"
                : "focus:border-primary focus:ring-primary/20",
            )}
            aria-label={`Digit ${index + 1} of OTP`}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
