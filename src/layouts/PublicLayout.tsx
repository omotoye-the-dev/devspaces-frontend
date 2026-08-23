import type { JSX } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/shared";

const PublicLayout = (): JSX.Element => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <Sidebar className="shrink-0" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;

