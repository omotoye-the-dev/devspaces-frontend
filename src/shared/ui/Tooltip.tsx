import { useEffect, useState, useRef, useId, type ReactNode, type JSX } from "react";
import { cn } from "@/shared/lib/utils/cn";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
  className?: string;
}

const positionStyles: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
  left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
  right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
};

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 100,
  disabled = false,
  className,
}: TooltipProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Visible while hovered OR focused; tracked separately so one ending doesn't hide the other.
  const activeRef = useRef({ hover: false, focus: false });
  const tooltipId = useId();

  // Never fire a pending show after unmount.
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  if (!content || disabled) {
    return <>{children}</>;
  }

  const showTooltip = (source: "hover" | "focus"): void => {
    activeRef.current[source] = true;
    // Restart the delay with a single pending timer, so hiding can always cancel it.
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = (source: "hover" | "focus"): void => {
    activeRef.current[source] = false;
    if (activeRef.current.hover || activeRef.current.focus) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => showTooltip("hover")}
      onMouseLeave={() => hideTooltip("hover")}
      onFocus={() => showTooltip("focus")}
      onBlur={() => hideTooltip("focus")}
    >
      {children}

      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            "absolute z-50 px-2 py-1 text-[11px] font-medium leading-none text-white bg-slate-900 rounded-md shadow-md whitespace-nowrap pointer-events-none select-none transition-all duration-150 animate-in fade-in zoom-in-95",
            positionStyles[position],
            className,
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
