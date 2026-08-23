import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/useToast";

export function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = (): void => {
    logout();
    toast.success("Logged out successfully");
    navigate("/auth/sign-in");
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full font-inter">
      <Button variant="danger" size="md" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}

export default HomePage;
