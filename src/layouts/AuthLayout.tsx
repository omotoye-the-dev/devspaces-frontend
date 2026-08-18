import Authleftimage from "@/components/pages/Authleftimage";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen lg:h-screen grid lg:grid-cols-2 overflow-x-hidden">
      {/* Image - LEFT */}
      <Authleftimage />

      {/* Auth page - RIGHT */}
      <main className="flex items-center justify-center bg-background min-h-screen lg:h-screen lg:max-h-screen overflow-y-auto p-4 sm:p-6 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
