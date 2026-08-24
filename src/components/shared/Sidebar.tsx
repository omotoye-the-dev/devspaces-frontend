import type { JSX } from "react";
import { useState } from "react";
import {
  HiHome,
  HiOutlineNewspaper,
  HiOutlineBookmark,
  HiOutlineBookOpen,
  HiOutlineClock,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserGroup,
  HiOutlineTrophy,
  HiOutlineGlobeAlt,
  HiOutlineChevronDown,
  HiOutlineCircleStack,
  HiOutlinePencilSquare,
  HiOutlineUser,
} from "react-icons/hi2";
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNodedotjs,
  SiPython,
} from "react-icons/si";
import { FaInfinity } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiLogIn } from "react-icons/fi";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/common";

export interface NavItem {
  id: string;
  label: string;
  icon: JSX.Element;
}

export interface TopicItem {
  id: string;
  label: string;
  icon: JSX.Element;
}

export interface SidebarProps {
  className?: string;
  activeItem?: string;
  onSelect?: (itemId: string) => void;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: <HiHome className="w-4.5 h-4.5" /> },
  { id: "my-feed", label: "My Feed", icon: <HiOutlineNewspaper className="w-4.5 h-4.5" /> },
  { id: "bookmarks", label: "Bookmarks", icon: <HiOutlineBookmark className="w-4.5 h-4.5" /> },
  { id: "reading-list", label: "Reading List", icon: <HiOutlineBookOpen className="w-4.5 h-4.5" /> },
  { id: "history", label: "History", icon: <HiOutlineClock className="w-4.5 h-4.5" /> },
];

const COMMUNITY_NAV_ITEMS: NavItem[] = [
  { id: "discussions", label: "Discussions", icon: <HiOutlineChatBubbleLeftRight className="w-4.5 h-4.5" /> },
  { id: "people", label: "People", icon: <HiOutlineUserGroup className="w-4.5 h-4.5" /> },
  { id: "leaderboard", label: "Leaderboard", icon: <HiOutlineTrophy className="w-4.5 h-4.5" /> },
  { id: "explore", label: "Explore", icon: <HiOutlineGlobeAlt className="w-4.5 h-4.5" /> },
];

const TOPIC_ITEMS: TopicItem[] = [
  {
    id: "javascript",
    label: "JavaScript",
    icon: <SiJavascript className="w-3.5 h-3.5 text-[#F7DF1E]" />,
  },
  {
    id: "typescript",
    label: "TypeScript",
    icon: <SiTypescript className="w-3.5 h-3.5 text-[#3178C6]" />,
  },
  {
    id: "react",
    label: "React",
    icon: <SiReact className="w-3.5 h-3.5 text-[#61DAFB]" />,
  },
  {
    id: "nodejs",
    label: "Node.js",
    icon: <SiNodedotjs className="w-3.5 h-3.5 text-[#5FA04E]" />,
  },
  {
    id: "python",
    label: "Python",
    icon: <SiPython className="w-3.5 h-3.5 text-[#3776AB]" />,
  },
  {
    id: "devops",
    label: "DevOps",
    icon: <FaInfinity className="w-3.5 h-3.5 text-[#0078D4]" />,
  },
  {
    id: "databases",
    label: "Databases",
    icon: <HiOutlineCircleStack className="w-3.5 h-3.5 text-text/50" />,
  },
];

const MOBILE_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: <HiHome className="w-5 h-5" /> },
  { id: "resources", label: "Resources", icon: <HiOutlineBookOpen className="w-5 h-5" /> },
  { id: "write", label: "Write", icon: <HiOutlinePencilSquare className="w-5 h-5" /> },
  { id: "saved", label: "Saved", icon: <HiOutlineBookmark className="w-5 h-5" /> },
  { id: "profile", label: "Profile", icon: <HiOutlineUser className="w-5 h-5" /> },
];

export function Sidebar({
  className,
  activeItem: activeItemProp,
  onSelect,
}: SidebarProps): JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [internalActiveItem, setInternalActiveItem] = useState("home");
  const currentActive = activeItemProp ?? internalActiveItem;

  const handleLogout = (): void => {
    logout();
    toast.success("Logged out successfully");
    navigate("/auth/sign-in");
  };

  const handleItemClick = (id: string) => {
    setInternalActiveItem(id);
    onSelect?.(id);
  };

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside
        className={cn(
          "hidden md:flex w-60 bg-white border-r border-border flex-col justify-between h-full max-h-screen shrink-0 p-3 overflow-y-auto overflow-x-hidden font-inter select-none",
          className
        )}
      >
        <div className="flex flex-col min-h-full justify-between">
          {/* Main Navigation */}
          <nav aria-label="Main Navigation" className="space-y-0.5">
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = currentActive === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] transition-colors duration-150 cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-text/70 hover:bg-border/40 hover:text-text font-medium"
                  )}
                >
                  <span className={isActive ? "text-primary" : "text-text/50"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-2 border-t border-border" />

          {/* Community Section */}
          <div className="space-y-0.5">
            <span className="px-3 text-[10px] font-bold tracking-wider text-text/40 uppercase block mb-1">
              Community
            </span>
            <nav aria-label="Community Navigation" className="space-y-0.5">
              {COMMUNITY_NAV_ITEMS.map((item) => {
                const isActive = currentActive === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] transition-colors duration-150 cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-text/70 hover:bg-border/40 hover:text-text font-medium"
                    )}
                  >
                    <span className={isActive ? "text-primary" : "text-text/50"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Divider */}
          <div className="my-2 border-t border-border" />

          {/* Topics Section */}
          <div className="space-y-0.5 flex-1 flex flex-col justify-between">
            <div>
              <span className="px-3 text-[10px] font-bold tracking-wider text-text/40 uppercase block mb-1">
                Topics
              </span>
              <nav aria-label="Topics Navigation" className="space-y-0.5">
                {TOPIC_ITEMS.map((topic) => {
                  const isActive = currentActive === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleItemClick(topic.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-1 rounded-lg text-[13px] transition-colors duration-150 cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-text/70 hover:bg-border/40 hover:text-text font-medium"
                      )}
                    >
                      <span className="flex items-center justify-center w-4 h-4 shrink-0">
                        {topic.icon}
                      </span>
                      <span>{topic.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={() => handleItemClick("view-all-topics")}
              className="w-full flex items-center gap-2.5 px-3 py-1 rounded-lg text-[13px] text-text/60 hover:bg-border/40 hover:text-text font-medium transition-colors duration-150 cursor-pointer mt-0.5"
            >
              <HiOutlineChevronDown className="w-3.5 h-3.5 text-text/40" />
              <span>View all topics</span>
            </button>
          </div>

          {/* Sidebar Auth Footer Action */}
          <div className="pt-3 border-t border-border mt-2">
            {isAuthenticated ? (
              <Button
                variant="danger"
                size="sm"
                fullWidth
                leftIcon={<FiLogOut className="w-4 h-4" />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                leftIcon={<FiLogIn className="w-4 h-4" />}
                onClick={() => navigate("/auth/sign-in")}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex items-center justify-around py-2 px-3 md:hidden font-inter shadow-md"
      >
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = currentActive === item.id;
          const isWrite = item.id === "write";
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-14 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer",
                isActive ? "text-primary font-semibold" : "text-text/70 hover:text-text"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center",
                  isWrite && "p-1 rounded-lg border border-border/80 bg-background text-text/80"
                )}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default Sidebar;
