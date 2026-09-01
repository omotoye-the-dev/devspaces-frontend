import type { JSX } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/shared";
import NavBar from "@/components/shared/NavBar";

const PublicLayout = (): JSX.Element => {
  const location = useLocation();

  // Write article routes: /articles/new and /articles/:id/edit
  const isWriteArticlePage =
    location.pathname === "/articles/new" ||
    location.pathname.startsWith("/articles/new") ||
    /^\/articles\/[^/]+\/edit\/?$/.test(location.pathname);

  // Profile page route: /profile and /profile/*
  const isProfilePage =
    location.pathname === "/profile" ||
    location.pathname.startsWith("/profile");

  // Hide sidebar completely on write article and profile pages
  const shouldHideSidebar = isWriteArticlePage || isProfilePage;

  // Home page route ("/")
  const isHomePage = location.pathname === "/";

  // Collapse sidebar on all pages aside from the home page
  const shouldCollapseSidebar = !isHomePage;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Top Navigation Bar */}
      <NavBar />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: hidden on write and profile pages, collapsed on non-home pages */}
        {!shouldHideSidebar && (
          <Sidebar
            key={location.pathname}
            defaultCollapsed={shouldCollapseSidebar}
            className="shrink-0 h-full max-h-full"
          />
        )}

        {/* Main Page View */}
        <main
          className={
            shouldHideSidebar
              ? "flex-1 overflow-y-auto p-2 sm:p-4 md:p-6"
              : "flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8"
          }
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PublicLayout;
