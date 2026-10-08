import type { ReactNode } from "react";
import {
  FiGrid,
  FiBookOpen,
  FiVideo,
  FiCode,
  FiTool,
  FiFileText,
  FiAward,
} from "react-icons/fi";

export interface ResourceCategory {
  id: string;
  label: string;
  icon: ReactNode;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { id: "all", label: "All", icon: <FiGrid className="w-4 h-4" /> },
  { id: "courses", label: "Courses", icon: <FiAward className="w-4 h-4" /> },
  { id: "documentation", label: "Documentation", icon: <FiFileText className="w-4 h-4" /> },
  { id: "books", label: "Books", icon: <FiBookOpen className="w-4 h-4" /> },
  { id: "videos", label: "Videos", icon: <FiVideo className="w-4 h-4" /> },
  { id: "repositories", label: "Repositories", icon: <FiCode className="w-4 h-4" /> },
  { id: "tools", label: "Tools", icon: <FiTool className="w-4 h-4" /> },
];
