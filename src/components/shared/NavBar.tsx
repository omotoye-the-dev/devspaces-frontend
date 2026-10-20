import { useEffect, useState, type JSX } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { LuPenLine } from "react-icons/lu";
import { MdOutlineSearch } from "react-icons/md";
import { Button, Avatar, Skeleton } from "../common/index";
import { useAuthStore } from "@/stores/useAuthStore";
import { getUserProfile, getProfileAvatar, type UserProfile } from "@/lib/api/user.api";
import { cn } from "@/lib/utils/cn";
import { GlobalSearchBar } from "./GlobalSearchBar";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";


export interface NavBarProps {
  isLoading?: boolean;
}

export function NavBarSkeleton(): JSX.Element {
  return (
    <nav className="w-full bg-white border-b border-border" aria-label="Loading Navigation">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo Skeleton */}
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="text" width={110} height={24} className="rounded-md" />
          </div>

          {/* Middle: Search Bar Skeleton */}
          <div className="w-96 px-4 hidden sm:block">
            <Skeleton variant="rounded" height={38} className="w-full rounded-md" />
          </div>

          {/* Right: Desktop Actions Skeleton */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-4">
              <Skeleton variant="text" width={60} height={18} />
              <Skeleton variant="text" width={70} height={18} />
              <Skeleton variant="text" width={45} height={18} />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton variant="rounded" width={90} height={36} className="rounded-md" />
              <Skeleton variant="circular" width={38} height={38} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function NavBar({ isLoading: isLoadingProp }: NavBarProps = {}): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasFetchedProfile, setHasFetchedProfile] = useState(false);

  const isArticlesActive = location.pathname === "/articles" || location.pathname.startsWith("/articles/");
  const isResourcesActive = location.pathname === "/resources" || location.pathname.startsWith("/resources/");
  const isDiscussionsActive = location.pathname === "/discussions" || location.pathname.startsWith("/discussions/");

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isSubscribed = true;
    getUserProfile()
      .then((data) => {
        if (isSubscribed && data) {
          setProfile(data);
        }
      })
      .catch(() => {
        // Handle fetch failure gracefully
      })
      .finally(() => {
        if (isSubscribed) {
          setHasFetchedProfile(true);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [isAuthenticated]);

  const isProfileLoading = isAuthenticated && !hasFetchedProfile && !profile;

  const currentProfile = isAuthenticated ? profile : null;

  const avatarUrl = getProfileAvatar(currentProfile);

  const displayName = currentProfile
    ? (() => {
        const p = currentProfile as Record<string, unknown>;
        return (
          [currentProfile.firstName || p.FirstName, currentProfile.lastName || p.LastName]
            .filter(Boolean)
            .join(" ") ||
          (currentProfile.name as string | undefined) ||
          (p.Name as string | undefined) ||
          (currentProfile.fullName as string | undefined) ||
          (p.FullName as string | undefined) ||
          (currentProfile.userName as string | undefined) ||
          (p.UserName as string | undefined) ||
          (currentProfile.username as string | undefined) ||
          (p.Username as string | undefined) ||
          undefined
        );
      })()
    : undefined;

  // Guests can browse every section; gated pages show their own "log in" panel
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      navigate("/playground");
      return;
    }

    navigate("/auth/sign-in");
  };

  if (isLoadingProp) {
    return <NavBarSkeleton />;
  }

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

              <span className="font-bold text-3xl text-text tracking-tight">DevSpace</span>
            </Link>
          </div>

          {/* Middle: Search */}
          <div className="flex-1 px-4 hidden sm:block max-w-lg">
            <GlobalSearchBar />
          </div>

          {/* Right: Links + Actions */}
          <div className="flex items-center gap-15">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 shrink-0">
              <Button
                type="button"
                variant={isArticlesActive ? "secondary" : "ghost"}
                className={cn(
                  "whitespace-nowrap transition-colors",
                  isArticlesActive && "font-semibold text-primary bg-primary/10 border-primary/20",
                )}
                onClick={() => handleNavigation("/articles")}
              >
                Articles
              </Button>

              <Button
                type="button"
                variant={isResourcesActive ? "secondary" : "ghost"}
                className={cn(
                  "whitespace-nowrap transition-colors",
                  isResourcesActive && "font-semibold text-primary bg-primary/10 border-primary/20",
                )}
                onClick={() => handleNavigation("/resources")}
              >
                Resources
              </Button>

              <Button
                variant={isDiscussionsActive ? "secondary" : "ghost"}
                type="button"
                className={cn(
                  "whitespace-nowrap transition-colors",
                  isDiscussionsActive && "font-semibold text-primary bg-primary/10 border-primary/20",
                )}
                onClick={() => handleNavigation("/discussions")}
              >
                Discussions
              </Button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="md"
                className="whitespace-nowrap shrink-0"
                leftIcon={isAuthenticated ? <LuPenLine className="w-4 h-4" /> : undefined}
                href="/articles/new"
              >
                {isAuthenticated ? "Write Article" : "Sign in"}
              </Button>

              {isAuthenticated && (
                <>
                  <NotificationBell />

                  {isProfileLoading ? (
                    <Skeleton variant="circular" width={40} height={40} />
                  ) : (
                    <Avatar
                      src={avatarUrl}
                      alt={displayName ?? "User avatar"}
                      name={displayName}
                      href="/profile"
                      fallbackIcon={!displayName ? <FaUser /> : undefined}
                      size="md"
                    />
                  )}
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              {isAuthenticated && <NotificationBell />}

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
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-out ${
            mobileSearchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setMobileSearchOpen(false)}
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
            <div className="px-4 pt-3 pb-4 flex items-center gap-2">
              <div className="flex-1">
                <GlobalSearchBar fullWidth />
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="inline-flex items-center justify-center p-2 rounded-md text-text/80 hover:bg-slate-100 transition-colors"
                aria-label="Close search"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={`md:hidden fixed inset-0 z-50 transition-opacity duration-1000 ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/10" />

          <div
            className={`absolute inset-y-0 right-0 w-[82%] max-w-sm bg-white border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "translate-x-full"
              }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
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

            <div className="flex flex-col gap-2 p-4 overflow-y-auto hover-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleNavigation("/articles");
                }}
                className={cn(
                  "px-2 py-2 text-left rounded-md transition-colors",
                  isArticlesActive
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-text/80 hover:text-text hover:bg-slate-50",
                )}
              >
                Articles
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleNavigation("/resources");
                }}
                className={cn(
                  "px-2 py-2 text-left rounded-md transition-colors",
                  isResourcesActive
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-text/80 hover:text-text hover:bg-slate-50",
                )}
              >
                Resources
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleNavigation("/discussions");
                }}
                className={cn(
                  "px-2 py-2 text-left rounded-md transition-colors",
                  isDiscussionsActive
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-text/80 hover:text-text hover:bg-slate-50",
                )}
              >
                Discussions
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
