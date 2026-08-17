import Authleftimage from "@/components/pages/Authleftimage";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Image - LEFT */}
      <Authleftimage/>

      {/* Auth page - RIGHT */}
      <main className="flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
