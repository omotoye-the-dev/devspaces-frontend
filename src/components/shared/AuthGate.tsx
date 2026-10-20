import type { JSX } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginPrompt, type LoginPromptProps } from "./LoginPrompt";

/**
 * Route guard that, unlike ProtectedRoute, does not redirect: guests keep the
 * page layout and see a "log in" panel in place of the page.
 */
export function AuthGate({ title, description, icon }: LoginPromptProps): JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto pt-6 sm:pt-12 font-inter">
        <LoginPrompt title={title} description={description} icon={icon} />
      </div>
    );
  }

  return <Outlet />;
}

export default AuthGate;
