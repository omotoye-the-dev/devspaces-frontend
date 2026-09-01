import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/useToast";
import { FiLogOut, FiLogIn } from "react-icons/fi";

export function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = (): void => {
    logout();
    toast.success("Logged out successfully");
    navigate("/auth/sign-in");
  };

  const handleLogin = (): void => {
    navigate("/auth/sign-in");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full font-inter space-y-6 text-center">
      <div className="space-y-2 max-w-lg">
        <h1 className="text-3xl font-extrabold tracking-tight text-text">
          Welcome to DevSpace
        </h1>
        <p className="text-text/60 text-sm">
          A modern developer platform for building, sharing, and connecting.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <Button variant="danger" size="md" leftIcon={<FiLogOut className="w-4 h-4" />} onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button variant="primary" size="md" leftIcon={<FiLogIn className="w-4 h-4" />} onClick={handleLogin}>
            Login
          </Button>
        )}
      </div>
    </div>
  );
}

export default HomePage;
