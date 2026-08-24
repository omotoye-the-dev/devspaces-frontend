import { useMemo, useState, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineSearch } from "react-icons/md";
import { FiMenu, FiX } from "react-icons/fi";
import { HiOutlineBell } from "react-icons/hi";
import { LuPenLine } from "react-icons/lu";
import { Input, Button, Avatar } from "./index";
import { useAuthStore } from "@/stores/useAuthStore";

const searchSuggestions = [
  "React hooks",
  "TypeScript patterns",
  "Tailwind CSS",
  "Node.js APIs",
  "UI design systems",
  "Authentication flows",
  "API integration",
  "Frontend performance",
  "State management",
  "DevSpace roadmap",
];

export function NavBar(): JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [notifications] = useState(3);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userAvatar = typeof window !== "undefined" ? localStorage.getItem("devspace_avatar") : null;
  const userName = typeof window !== "undefined" ? localStorage.getItem("devspace_user_name") : null;

  const filteredSuggestions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return searchSuggestions.slice(0, 5);
    }

    return searchSuggestions.filter((item) =>
      item.toLowerCase().includes(term),
    );
  }, [searchTerm]);

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
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleProtectedNavigation("/articles")}
               
              >
                Articles
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => handleProtectedNavigation("/resources")}
              >
                Resources
              </Button>

              <Button
                variant="ghost"
                type="button"
                onClick={() => handleProtectedNavigation("/tags")}
              >
                Tags
              </Button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant="primary"
                size="md"
                fullWidth={true}
                leftIcon={isAuthenticated ? <LuPenLine className="w-4 h-4" /> : undefined}
                onClick={handlePrimaryAction}
              >
                {isAuthenticated ? "Write Article" : "Sign in"}
              </Button>

              {isAuthenticated && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Notifications"
                    className="relative inline-flex items-center justify-center p-2 rounded-md text-text/80 hover:bg-slate-100 transition-colors"
                  >
                    <HiOutlineBell className="w-6 h-6" />

                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-blue-500 rounded-full">
                        {notifications}
                      </span>
                    )}
                  </Button>

                  <Avatar
                    src={userAvatar ?? undefined}
                    alt="User profile"
                    name={userName ?? "User"}
                    size="md"
                  />
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen((state) => !state);
                  setMobileOpen(false);
                }}
                className="inline-flex items-center justify-center p-2 rounded-md text-text/80 hover:bg-slate-100 transition-colors"
                aria-label={mobileSearchOpen ? "Close search" : "Open search"}
              >
                <MdOutlineSearch className="w-6 h-6" />
              </button>

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

        <div
          className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-out ${
            mobileSearchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => {
            setMobileSearchOpen(false);
            setSearchTerm("");
          }}
        >
          <div
            className={`absolute inset-0 bg-black/10 transition-opacity duration-500 ease-out ${
              mobileSearchOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            className={`relative bg-white border-b border-border shadow-sm transform transition-all duration-500 ease-out ${
              mobileSearchOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="bg-gray-200 border-gray-300 focus:ring-primary focus:border-primary"
                    placeholder="Search articles, tags, resources..."
                    inputSize="md"
                    leftIcon={<MdOutlineSearch className="text-text/40" />}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileSearchOpen(false);
                    setSearchTerm("");
                  }}
                  className="inline-flex items-center justify-center p-2 rounded-md text-text/80 hover:bg-slate-100 transition-colors"
                  aria-label="Close search"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {mobileSearchOpen && filteredSuggestions.length > 0 && (
                <div className="mt-3 rounded-xl border border-border bg-white shadow-sm overflow-hidden transition-all duration-500 ease-out">
                  {filteredSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSearchTerm(item);
                        setMobileSearchOpen(false);
                        setSearchTerm("");
                      }}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-text/80 hover:bg-slate-50 transition-colors"
                    >
                      <span>{item}</span>
                      <MdOutlineSearch className="w-4 h-4 text-text/40" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={`md:hidden fixed inset-0 z-50 transition-opacity duration-1000 ${
            mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/10" />

          <div
            className={`absolute inset-y-0 right-0 w-[82%] max-w-sm bg-white border-l border-border shadow-2xl transition-transform duration-300 ease-out ${
              mobileOpen ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <span className="font-semibold text-text">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center p-2 rounded-md text-text/80 hover:bg-slate-100 transition-colors"
                aria-label="Close navigation menu"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 p-4">
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
                size="md"
                leftIcon={isAuthenticated ? <LuPenLine className="w-4 h-4" /> : undefined}
                onClick={() => {
                  setMobileOpen(false);
                  handlePrimaryAction();
                }}
              >
                {isAuthenticated ? "Write Article" : "Sign in"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;