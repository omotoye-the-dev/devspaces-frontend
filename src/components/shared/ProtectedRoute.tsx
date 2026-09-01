import type { JSX } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export interface ProtectedRouteProps {
  children?: JSX.Element;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
