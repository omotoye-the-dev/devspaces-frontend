import type { JSX, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineLockClosed } from "react-icons/hi2";
import { Button } from "@/components/common";
import { cn } from "@/lib/utils/cn";

export interface LoginPromptProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

/**
 * In-place "log in to see this" panel. Used instead of redirecting guests so
 * the rest of the page chrome stays visible.
 */
export function LoginPrompt({
  title,
  description,
  icon,
  className,
}: LoginPromptProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path: string): void => {
    navigate(path, { state: { from: location } });
  };

  return (
    <div
      className={cn(
        "bg-white border border-border rounded-lg p-8 sm:p-10 text-center space-y-3",
        className,
      )}
    >
      <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
        {icon ?? <HiOutlineLockClosed className="w-6 h-6" />}
      </div>
      <h2 className="text-base font-semibold text-text">{title}</h2>
      {description && <p className="text-xs text-text/50 max-w-sm mx-auto">{description}</p>}
      <div className="flex items-center justify-center gap-2 pt-1">
        <Button variant="primary" size="md" onClick={() => goTo("/auth/sign-in")}>
          Log in
        </Button>
        <Button variant="outline" size="md" onClick={() => goTo("/auth/sign-up")}>
          Create account
        </Button>
      </div>
    </div>
  );
}

export default LoginPrompt;
