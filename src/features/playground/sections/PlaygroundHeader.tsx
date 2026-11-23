import { useState, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Tag, useToast } from "@/shared/ui";
import { logoutUser } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/store";
import { STORAGE_KEYS, storage } from "@/shared/lib/storage";
import { FiLogOut } from "react-icons/fi";

/** Back link, logout, and the hero with jump links to every section. */
export function PlaygroundHeader(): JSX.Element {
  const navigate = useNavigate();
  const logoutStore = useAuthStore((state) => state.logout);
  const { success } = useToast();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    const refreshToken = storage.get(STORAGE_KEYS.refreshToken) || "";
    try {
      await logoutUser({ refreshToken });
    } catch {
      // Proceed with client logout even if backend request fails
    } finally {
      logoutStore();
      success("Logged out successfully", {
        description: "You have been redirected to the home page.",
      });
      setIsLoggingOut(false);
      navigate("/");
    }
  };

  return (
    <>
      {/* Navigation & Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text/70 hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to DevSpace Home</span>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={isLoggingOut}
            onClick={handleLogout}
            leftIcon={<FiLogOut className="w-3.5 h-3.5" />}
            className="text-xs font-semibold"
          >
            Logout
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Tag variant="primary" dot>
            11 UI Components
          </Tag>
          <Tag variant="teal">Individual Showcase</Tag>
        </div>
      </div>

      {/* Hero Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xl shadow-xs">
            D
          </span>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text">
              DevSpace Component Library
            </h1>
            <p className="text-xs text-text/60">
              Every component displayed individually with its variants, sizes, and interactive
              states.
            </p>
          </div>
        </div>

        {/* Quick Jump Links */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="font-bold text-text/50 uppercase tracking-wider text-[10px]">
            Jump to:
          </span>
          {[
            "Button",
            "Input",
            "Textarea",
            "Select",
            "Avatar",
            "Tag",
            "Card",
            "Modal",
            "Tabs",
            "Toast",
            "Skeleton",
            "EmptyState",
            "ErrorState",
          ].map((comp) => (
            <a
              key={comp}
              href={`#${comp.toLowerCase()}`}
              className="px-2 py-1 bg-white border border-border rounded-md hover:border-primary hover:text-primary transition-colors font-medium"
            >
              {comp}
            </a>
          ))}
        </div>
      </header>
    </>
  );
}
