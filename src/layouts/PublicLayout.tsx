import type { JSX } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/shared";
import NavBar from "@/components/common/NavBar";

const PublicLayout = (): JSX.Element => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Top Navigation Bar */}
      <NavBar />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar className="shrink-0 h-full max-h-full" />

        {/* Main Page View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PublicLayout;


