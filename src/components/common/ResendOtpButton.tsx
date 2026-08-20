import { useState, useEffect, type JSX } from "react";
import { FaRedo } from "react-icons/fa";
import { cn } from "@/lib/utils/cn";

export interface ResendOtpButtonProps {
  /** Callback triggered when user clicks Resend */
  onResend: () => Promise<void>;
  /** Countdown cooldown duration in seconds (default: 60) */
  cooldownSeconds?: number;
  /** Initial timer value in seconds (default: 60) */
  initialTimer?: number;
  /** External disabled state */
  disabled?: boolean;
  /** Custom container class */
  className?: string;
  /** Label for non-counting text */
  promptText?: string;
}

export function ResendOtpButton({
  onResend,
  cooldownSeconds = 60,
  initialTimer = 60,
  disabled = false,
  className,
  promptText = "Didn't receive the code?",
}: ResendOtpButtonProps): JSX.Element {
  const [timer, setTimer] = useState<number>(initialTimer);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendClick = async () => {
    if (timer > 0 || isLoading || disabled) return;
    setIsLoading(true);
    try {
      await onResend();
      setTimer(cooldownSeconds);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center justify-between text-xs pt-0.5", className)}>
      <span className="text-text/60">{promptText}</span>

      {timer > 0 ? (
        <span className="font-medium text-text/50">
          Resend in <span className="font-mono font-semibold text-primary">{timer}s</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={handleResendClick}
          disabled={disabled || isLoading}
          className="font-semibold text-primary hover:underline inline-flex items-center gap-1.5 disabled:opacity-50 focus:outline-none transition-colors"
        >
          <FaRedo className={cn("w-3 h-3", isLoading && "animate-spin")} />
          <span>{isLoading ? "Sending..." : "Resend code"}</span>
        </button>
      )}
    </div>
  );
}
