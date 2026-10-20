import { useEffect, useRef, useState, type JSX } from "react";
import {
  HiHome,
  // HiOutlineNewspaper,
  HiOutlineBookmark,
  // HiOutlineBookOpen,
  HiOutlineClock,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserGroup,
  HiOutlineTrophy,
  HiOutlineGlobeAlt,
  // HiOutlineChevronDown,
  // HiOutlineCircleStack,
  HiOutlinePencilSquare,
  HiOutlineUser,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
// import { SiJavascript, SiTypescript, SiReact, SiNodedotjs, SiPython } from "react-icons/si";
// import { FaInfinity } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";
import { FiLogOut, FiLogIn } from "react-icons/fi";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/useToast";
import { Button, Skeleton } from "@/components/common";
import { getTags, type Tag } from "@/features/articles/api/tagApi";
import { FiHash } from "react-icons/fi";

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
  isLoading?: boolean;
  defaultCollapsed?: boolean;
}

export function SidebarSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <>
      <aside
        className={cn(
          "hidden md:flex w-60 bg-white border-r border-border flex-col justify-between h-full max-h-screen shrink-0 p-3 overflow-y-auto overflow-x-hidden font-inter select-none hover-scrollbar",
          className,
        )}
        aria-label="Loading Sidebar"
      >
        <div className="flex flex-col min-h-full justify-between space-y-4">
          <div className="space-y-4">
            {/* Main Nav Items Skeleton */}
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-1.5">
                  <Skeleton variant="circular" width={18} height={18} />
                  <Skeleton variant="text" width={`${65 + (i % 3) * 10}%`} height={16} />
                </div>
              ))}
            </div>

            <div className="my-2 border-t border-border" />

            {/* Community Section Skeleton */}
            <div className="space-y-2">
              <Skeleton variant="text" width={70} height={12} className="px-3 mb-1" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-1.5">
                  <Skeleton variant="circular" width={18} height={18} />
                  <Skeleton variant="text" width={`${55 + (i % 3) * 15}%`} height={16} />
                </div>
              ))}
            </div>
          </div>

          {/* <div className="my-2 border-t border-border" /> */}

          {/* Topics Section Skeleton */}
          {/* <div className="space-y-2 flex-1">
            <Skeleton variant="text" width={55} height={12} className="px-3 mb-1" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-1">
                <Skeleton variant="circular" width={14} height={14} />
                <Skeleton variant="text" width={`${50 + (i % 4) * 10}%`} height={14} />
              </div>
            ))}
          </div> */}

          {/* Footer Skeleton */}
          <div className="pt-3 border-t border-border">
            <Skeleton variant="rounded" height={36} className="w-full rounded-md" />
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Skeleton */}
      <nav
        aria-label="Loading Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex items-center justify-around py-2 px-3 md:hidden font-inter shadow-md"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 min-w-14">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={32} height={10} />
          </div>
        ))}
      </nav>
    </>
  );
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { id: "feed", label: "Feed", icon: <HiHome className="w-4.5 h-4.5" /> },
 
  { id: "bookmarks", label: "Saved", icon: <HiOutlineBookmark className="w-4.5 h-4.5" /> },
  // {
  //   id: "reading-list",
  //   label: "Reading List",
  //   icon: <HiOutlineBookOpen className="w-4.5 h-4.5" />,
  // },
  { id: "history", label: "History", icon: <HiOutlineClock className="w-4.5 h-4.5" /> },
   { id: "explore", label: "Explore", icon: <HiOutlineGlobeAlt className="w-4.5 h-4.5" /> },  
];

const COMMUNITY_NAV_ITEMS: NavItem[] = [
  {
    id: "discussions",
    label: "Discussions",
    icon: <HiOutlineChatBubbleLeftRight className="w-4.5 h-4.5" />,
  },
  { id: "people", label: "People", icon: <HiOutlineUserGroup className="w-4.5 h-4.5" /> },
  { id: "leaderboard", label: "Leaderboard", icon: <HiOutlineTrophy className="w-4.5 h-4.5" /> },
];

// const TOPIC_ITEMS: TopicItem[] = [
//   {
//     id: "javascript",
//     label: "JavaScript",
//     icon: <SiJavascript className="w-3.5 h-3.5 text-[#F7DF1E]" />,
//   },
//   {
//     id: "typescript",
//     label: "TypeScript",
//     icon: <SiTypescript className="w-3.5 h-3.5 text-[#3178C6]" />,
//   },
//   {
//     id: "react",
//     label: "React",
//     icon: <SiReact className="w-3.5 h-3.5 text-[#61DAFB]" />,
//   },
//   {
//     id: "nodejs",
//     label: "Node.js",
//     icon: <SiNodedotjs className="w-3.5 h-3.5 text-[#5FA04E]" />,
//   },
//   {
//     id: "python",
//     label: "Python",
//     icon: <SiPython className="w-3.5 h-3.5 text-[#3776AB]" />,
//   },
//   {
//     id: "devops",
//     label: "DevOps",
//     icon: <FaInfinity className="w-3.5 h-3.5 text-[#0078D4]" />,
//   },
//   {
//     id: "databases",
//     label: "Databases",
//     icon: <HiOutlineCircleStack className="w-3.5 h-3.5 text-text/50" />,
//   },
// ];

const MOBILE_NAV_ITEMS: NavItem[] = [
  { id: "feed", label: "Feed", icon: <HiHome className="w-5 h-5" /> },
  { id: "write", label: "Write", icon: <HiOutlinePencilSquare className="w-5 h-5" /> },
  { id: "saved", label: "Saved", icon: <HiOutlineBookmark className="w-5 h-5" /> },
  { id: "profile", label: "Profile", icon: <HiOutlineUser className="w-5 h-5" /> },
];

export function Sidebar({
  className,
  activeItem: activeItemProp,
  onSelect,
  isLoading = false,
  defaultCollapsed = false,
}: SidebarProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [internalActiveItem, setInternalActiveItem] = useState("feed");
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isHovered, setIsHovered] = useState(false);

  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const hasFetchedTagsRef = useRef(false);

  const [prevDefaultCollapsed, setPrevDefaultCollapsed] = useState(defaultCollapsed);
  if (prevDefaultCollapsed !== defaultCollapsed) {
    setPrevDefaultCollapsed(defaultCollapsed);
    setIsCollapsed(defaultCollapsed);
  }

  const isExpanded = !isCollapsed || isHovered;

  // Lazily load the top 5 most-used tags the first time the sidebar is opened/expanded.
  // The sidebar only toggles visibility here (it never unmounts while hovering), so the
  // fetch is allowed to resolve and update state even if the user has since moved away.
  useEffect(() => {
    if (!isExpanded || hasFetchedTagsRef.current) return;
    hasFetchedTagsRef.current = true;
    setIsTagsLoading(true);

    getTags({ pageSize: 50 })
      .then((tags) => {
        const top5 = [...tags]
          .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
          .slice(0, 5);
        setPopularTags(top5);
      })
      .catch(() => {
        hasFetchedTagsRef.current = false;
      })
      .finally(() => {
        setIsTagsLoading(false);
      });
  }, [isExpanded]);

  const routeActiveItem =
    location.pathname === "/"
      ? "feed"
      : location.pathname.startsWith("/articles")
        ? "explore"
        : location.pathname.startsWith("/discussions")
          ? "discussions"
          : location.pathname.startsWith("/people")
            ? "people"
            : location.pathname.startsWith("/leaderboard")
              ? "leaderboard"
              : location.pathname.startsWith("/profile")
                ? "profile"
                : location.pathname.startsWith("/resources")
                  ? "resources"
                  : location.pathname.startsWith("/saved")
                    ? "bookmarks"
                    : undefined;

  const currentActive = activeItemProp ?? routeActiveItem ?? internalActiveItem;

  if (isLoading) {
    return <SidebarSkeleton className={className} />;
  }

  const handleLogout = (): void => {
    logout();
    toast.success("Logged out successfully");
    navigate("/auth/sign-in");
  };

  const handleToggleCollapse = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    if (isCollapsed) {
      setIsCollapsed(false);
    } else {
      setIsCollapsed(true);
      setIsHovered(false);
    }
  };

  const handleItemClick = (id: string): void => {
    setInternalActiveItem(id);
    onSelect?.(id);
    if (isCollapsed) {
      setIsHovered(false);
    }
    if (!onSelect) {
      if (id === "feed" || id === "Feed" || id === "home") navigate("/");
      else if (id === "explore") navigate("/articles");
      else if (id === "discussions") navigate("/discussions");
      else if (id === "people") navigate("/people");
      else if (id === "leaderboard") navigate("/leaderboard");
      else if (id === "resources") navigate("/resources");
      else if (id === "history") navigate("/history");
      else if (id === "write") navigate("/articles/new");
      else if (id === "saved" || id === "bookmarks") navigate("/saved");
      else if (id === "profile") navigate(isAuthenticated ? "/profile" : "/auth/sign-in");
    }
  };

  const handleTagClick = (tag: Tag): void => {
    navigate(`/articles?tag=${encodeURIComponent(tag.slug || tag.name)}`);
  };

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside
        onMouseEnter={() => {
          if (isCollapsed) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (isHovered) setIsHovered(false);
        }}
        className={cn(
          "hidden md:flex bg-white border-r border-border flex-col justify-between h-full max-h-screen shrink-0 overflow-y-auto overflow-x-hidden font-inter select-none transition-all duration-300 ease-in-out hover-scrollbar",
          isExpanded ? "w-60 p-3" : "w-16 p-2 items-center",
          className,
        )}
      >
        <div className="flex flex-col min-h-full justify-between w-full">
          {/* Top navigation container */}
          <div className="w-full space-y-1">
            {/* Header with Collapse / Expand Toggle Button */}
            <div
              className={cn(
                "flex items-center pb-2 mb-1 border-b border-border/60 transition-colors",
                isExpanded ? "justify-between px-1" : "justify-center w-full",
              )}
            >
              {isExpanded && (
                <span className="text-[11px] font-extrabold text-text/40 uppercase tracking-wider truncate">
                  Menu
                </span>
              )}
              <button
                type="button"
                onClick={handleToggleCollapse}
                aria-label={
                  !isCollapsed
                    ? "Collapse sidebar"
                    : isHovered
                      ? "Pin sidebar open"
                      : "Expand sidebar"
                }
                title={
                  !isCollapsed
                    ? "Collapse sidebar"
                    : isHovered
                      ? "Pin sidebar open"
                      : "Expand sidebar"
                }
                className="p-1.5 rounded-lg text-text/60 hover:text-text hover:bg-border/50 transition-colors cursor-pointer shrink-0"
              >
                {!isCollapsed ? (
                  <HiOutlineChevronLeft className="w-4 h-4" />
                ) : (
                  <HiOutlineChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Main Navigation */}
            <nav aria-label="Main Navigation" className="space-y-0.5 w-full">
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive = currentActive === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={!isExpanded ? item.label : undefined}
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      "flex items-center rounded-lg text-[13px] transition-colors duration-150 cursor-pointer",
                      isExpanded ? "w-full gap-2.5 px-3 py-1.5" : "justify-center p-2.5 w-full",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-text/70 hover:bg-border/40 hover:text-text font-medium",
                    )}
                  >
                    <span className={cn("shrink-0", isActive ? "text-primary" : "text-text/50")}>
                      {item.icon}
                    </span>
                    {isExpanded && <span className="truncate whitespace-nowrap">{item.label}</span>}
                  </button>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="my-2 border-t border-border w-full" />

            {/* Community Section */}
            <div className="space-y-0.5 w-full">
              {isExpanded && (
                <span className="px-3 text-[10px] font-bold tracking-wider text-text/40 uppercase block mb-1 truncate whitespace-nowrap">
                  Community
                </span>
              )}
              <nav aria-label="Community Navigation" className="space-y-0.5">
                {COMMUNITY_NAV_ITEMS.map((item) => {
                  const isActive = currentActive === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={!isExpanded ? item.label : undefined}
                      onClick={() => handleItemClick(item.id)}
                      className={cn(
                        "flex items-center rounded-lg text-[13px] transition-colors duration-150 cursor-pointer",
                        isExpanded ? "w-full gap-2.5 px-3 py-1.5" : "justify-center p-2.5 w-full",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-text/70 hover:bg-border/40 hover:text-text font-medium",
                      )}
                    >
                      <span className={cn("shrink-0", isActive ? "text-primary" : "text-text/50")}>
                        {item.icon}
                      </span>
                      {isExpanded && <span className="truncate whitespace-nowrap">{item.label}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Popular Tags Section */}
            {isExpanded && (
              <div className="space-y-0.5 w-full pt-2">
                <span className="px-3 text-[10px] font-bold tracking-wider text-text/40 uppercase block mb-1 truncate whitespace-nowrap">
                  Popular Tags
                </span>
                {isTagsLoading ? (
                  <div className="space-y-2 px-3 py-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        variant="text"
                        width={`${55 + (i % 3) * 15}%`}
                        height={14}
                      />
                    ))}
                  </div>
                ) : popularTags.length > 0 ? (
                  <nav aria-label="Popular Tags" className="space-y-0.5">
                    {popularTags.map((tag) => (
                      <button
                        key={tag.id || tag.slug || tag.name}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="flex items-center w-full gap-2.5 px-3 py-1 rounded-lg text-[13px] text-text/70 hover:bg-border/40 hover:text-text font-medium transition-colors duration-150 cursor-pointer"
                      >
                        <FiHash className="w-3.5 h-3.5 text-text/40 shrink-0" />
                        <span className="truncate whitespace-nowrap flex-1 text-left">
                          {tag.name}
                        </span>
                        {typeof tag.usageCount === "number" && (
                          <span className="text-[11px] text-text/40 shrink-0">
                            {tag.usageCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                ) : (
                  <p className="px-3 text-[11px] text-text/40">No tags yet</p>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          {/* <div className="my-2 border-t border-border w-full" /> */}

          {/* Topics Section */}
          {/*
          <div className="space-y-0.5 flex-1 flex flex-col justify-between w-full">
            <div>
              {isExpanded && (
                <span className="px-3 text-[10px] font-bold tracking-wider text-text/40 uppercase block mb-1 truncate whitespace-nowrap">
                  Topics
                </span>
              )}
              <nav aria-label="Topics Navigation" className="space-y-0.5">
                {TOPIC_ITEMS.map((topic) => {
                  const isActive = currentActive === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      title={!isExpanded ? topic.label : undefined}
                      onClick={() => handleItemClick(topic.id)}
                      className={cn(
                        "flex items-center rounded-lg text-[13px] transition-colors duration-150 cursor-pointer",
                        isExpanded ? "w-full gap-2.5 px-3 py-1" : "justify-center p-2.5 w-full",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-text/70 hover:bg-border/40 hover:text-text font-medium",
                      )}
                    >
                      <span className="flex items-center justify-center w-4 h-4 shrink-0">
                        {topic.icon}
                      </span>
                      {isExpanded && (
                        <span className="truncate whitespace-nowrap">{topic.label}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {isExpanded && (
              <button
                type="button"
                onClick={() => handleItemClick("view-all-topics")}
                className="w-full flex items-center gap-2.5 px-3 py-1 rounded-lg text-[13px] text-text/60 hover:bg-border/40 hover:text-text font-medium transition-colors duration-150 cursor-pointer mt-0.5 whitespace-nowrap"
              >
                <HiOutlineChevronDown className="w-3.5 h-3.5 text-text/40 shrink-0" />
                <span className="truncate">View all topics</span>
              </button>
            )}
          </div>
          */}

          {/* Sidebar Auth Footer Action */}
          <div
            className={cn(
              "border-t border-border mt-2 w-full transition-all duration-300",
              isExpanded ? "p-3" : "p-1 py-2",
            )}
          >
            {isAuthenticated ? (
              <Button
                variant="danger"
                size="sm"
                fullWidth
                leftIcon={<FiLogOut className="w-4 h-4 shrink-0" />}
                onClick={handleLogout}
                title={!isExpanded ? "Logout" : undefined}
                className={!isExpanded ? "px-0 justify-center" : ""}
              >
                {isExpanded && <span className="whitespace-nowrap truncate">Logout</span>}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                leftIcon={<FiLogIn className="w-4 h-4 shrink-0" />}
                onClick={() => navigate("/auth/sign-in")}
                title={!isExpanded ? "Login" : undefined}
                className={!isExpanded ? "px-0 justify-center" : ""}
              >
                {isExpanded && <span className="whitespace-nowrap truncate">Login</span>}
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
                isActive ? "text-primary font-semibold" : "text-text/70 hover:text-text",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center",
                  isWrite && "p-1 rounded-lg border border-border/80 bg-background text-text/80",
                )}
              >
                {item.icon}
              </span>
              <span>{item.id === "profile" && !isAuthenticated ? "Log in" : item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default Sidebar;
