import { useState, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineSearch } from "react-icons/md";
import { FiMenu, FiX } from "react-icons/fi";
import { HiOutlineBell } from "react-icons/hi";
import { LuPenLine } from "react-icons/lu";
import { Input, Button, Avatar } from "./index";
import { useAuthStore } from "@/stores/useAuthStore";

export function NavBar(): JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [notifications] = useState(3);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleProtectedNavigation = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
      return;
    }

    navigate("/auth/sign-in");
  };

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      navigate("/playground");
      return;
    }

    navigate("/auth/sign-in");
  };

  return (
    <nav className="w-full bg-white border-b border-border">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-mono font-bold text-primary text-2xl leading-none">
                &lt;/&gt;
              </span>

              <span className="font-bold text-3xl text-text tracking-tight">
                DevSpace
              </span>
            </Link>
          </div>

          {/* Middle: Search */}
          <div className="w-200 px-4 hidden sm:block">
            <Input
              className="bg-gray-100 border-gray-300 focus:ring-primary focus:border-primary"
              placeholder="Search articles, tags, resources..."
              inputSize="md"
              leftIcon={
                <MdOutlineSearch className="text-text/40" />
              }
            />
          </div>

          {/* Right: Links + Actions */}
          <div className="flex items-center gap-15">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleProtectedNavigation("/articles")}
                className="text-text/80 hover:text-text font-medium transition-colors"
              >
                Articles
              </button>

              <button
                type="button"
                onClick={() => handleProtectedNavigation("/resources")}
                className="text-text/80 hover:text-text font-medium transition-colors"
              >
                Resources
              </button>

              <button
                type="button"
                onClick={() => handleProtectedNavigation("/tags")}
                className="text-text/80 hover:text-text font-medium transition-colors"
              >
                Tags
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant="primary"
                size="sm"
                leftIcon={isAuthenticated ? <LuPenLine className="w-4 h-4" /> : undefined}
                onClick={handlePrimaryAction}
              >
                {isAuthenticated ? "Write Article" : "Sign in / Sign up"}
              </Button>

              {isAuthenticated && (
                <>
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="relative inline-flex items-center justify-center p-2 rounded-md text-text/80 hover:bg-slate-100 transition-colors"
                  >
                    <HiOutlineBell className="w-5 h-5" />

                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-blue-500 rounded-full">
                        {notifications}
                      </span>
                    )}
                  </button>

                  <Avatar
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
                    alt="User profile"
                    name="Olawale Onabanjo"
                    size="md"
                  />
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen((state) => !state)}
                className="inline-flex items-center justify-center p-2 rounded-md text-text/80 hover:bg-slate-100 transition-colors"
                aria-expanded={mobileOpen}
                aria-label={
                  mobileOpen ? "Close navigation menu" : "Open navigation menu"
                }
              >
                {mobileOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-border/60">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleProtectedNavigation("/articles");
                }}
                className="px-2 py-2 text-left text-text/80 hover:text-text hover:bg-slate-50 rounded-md transition-colors"
              >
                Articles
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleProtectedNavigation("/resources");
                }}
                className="px-2 py-2 text-left text-text/80 hover:text-text hover:bg-slate-50 rounded-md transition-colors"
              >
                Resources
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleProtectedNavigation("/tags");
                }}
                className="px-2 py-2 text-left text-text/80 hover:text-text hover:bg-slate-50 rounded-md transition-colors"
              >
                Tags
              </button>

              <Button
                variant="primary"
                size="sm"
                leftIcon={isAuthenticated ? <LuPenLine className="w-4 h-4" /> : undefined}
                onClick={() => {
                  setMobileOpen(false);
                  handlePrimaryAction();
                }}
              >
                {isAuthenticated ? "Write Article" : "Sign in / Sign up"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;