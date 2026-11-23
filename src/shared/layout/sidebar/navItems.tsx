import type { JSX } from "react";
import {
  HiHome,
  HiOutlineBookmark,
  HiOutlineClock,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserGroup,
  HiOutlineTrophy,
  HiOutlineGlobeAlt,
  HiOutlinePencilSquare,
  HiOutlineUser,
} from "react-icons/hi2";

/* Navigation entries for the desktop and mobile sidebars. */

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

export const MAIN_NAV_ITEMS: NavItem[] = [
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

export const COMMUNITY_NAV_ITEMS: NavItem[] = [
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

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { id: "feed", label: "Feed", icon: <HiHome className="w-5 h-5" /> },
  { id: "write", label: "Write", icon: <HiOutlinePencilSquare className="w-5 h-5" /> },
  { id: "saved", label: "Saved", icon: <HiOutlineBookmark className="w-5 h-5" /> },
  { id: "profile", label: "Profile", icon: <HiOutlineUser className="w-5 h-5" /> },
];
