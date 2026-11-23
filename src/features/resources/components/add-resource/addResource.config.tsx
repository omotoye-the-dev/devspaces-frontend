import type { JSX } from "react";
import { FiBook, FiVideo, FiCode, FiFolder } from "react-icons/fi";
import { LuGraduationCap, LuWrench } from "react-icons/lu";

export interface NewPartDraft {
  id: string;
  title: string;
  description?: string;
  accessType: 0 | 1;
  contentUrl?: string;
  partFile?: File | null;
}

export type ResourceCategoryType =
  "courses" | "documentation" | "books" | "videos" | "repositories" | "tools";

export const CATEGORY_NAMES: Record<ResourceCategoryType, string> = {
  documentation: "Documentation",
  courses: "Course",
  books: "Book",
  videos: "Video",
  repositories: "Repository",
  tools: "Tool",
};

export type UploadMode = "url" | "file";

export interface NewResourcePayload {
  title: string;
  category: ResourceCategoryType;
  uploadMode: UploadMode;
  url?: string;
  file?: File | null;
  coverImage?: string | null;
  description: string;
  tags: string[];
}

export interface CategoryConfig {
  id: ResourceCategoryType;
  label: string;
  icon: JSX.Element;
  defaultMode: UploadMode;
  urlPlaceholder: string;
  urlHint: string;
  fileLabel: string;
  fileAccept: string;
  fileHint: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "documentation",
    label: "Documentation",
    icon: <FiFolder className="w-3.5 h-3.5 text-emerald-600" />,
    defaultMode: "url",
    urlPlaceholder: "https://docs.technology.dev",
    urlHint: "Link to official documentation or guide",
    fileLabel: "Upload Document / Cheatsheet",
    fileAccept: ".pdf,.html,.md",
    fileHint: "PDF, Markdown, or HTML (Max 25MB)",
  },
  {
    id: "courses",
    label: "Courses",
    icon: <LuGraduationCap className="w-3.5 h-3.5 text-blue-600" />,
    defaultMode: "url",
    urlPlaceholder: "https://course-platform.com/course-title",
    urlHint: "Link to online course or bootcamp",
    fileLabel: "Upload Course Syllabus / Materials",
    fileAccept: ".pdf,.zip",
    fileHint: "PDF or ZIP archive (Max 30MB)",
  },
  {
    id: "books",
    label: "Books",
    icon: <FiBook className="w-3.5 h-3.5 text-rose-600" />,
    defaultMode: "file",
    urlPlaceholder: "https://book-website.com/download",
    urlHint: "Direct book download or reading page URL",
    fileLabel: "Upload eBook / PDF Document",
    fileAccept: ".pdf,.epub,.mobi",
    fileHint: "PDF, EPUB, or MOBI (Max 50MB)",
  },
  {
    id: "videos",
    label: "Videos",
    icon: <FiVideo className="w-3.5 h-3.5 text-purple-600" />,
    defaultMode: "url",
    urlPlaceholder: "https://youtube.com/watch?v=... or https://vimeo.com/...",
    urlHint: "YouTube, Vimeo, or video stream link",
    fileLabel: "Upload Video File",
    fileAccept: ".mp4,.webm,.mov",
    fileHint: "MP4, WebM, or MOV (Max 100MB)",
  },
  {
    id: "repositories",
    label: "Repositories",
    icon: <FiCode className="w-3.5 h-3.5 text-amber-600" />,
    defaultMode: "url",
    urlPlaceholder: "https://github.com/organization/repository",
    urlHint: "GitHub, GitLab, or Git repo URL",
    fileLabel: "Upload Source Archive",
    fileAccept: ".zip,.tar.gz",
    fileHint: "ZIP or TAR.GZ archive (Max 25MB)",
  },
  {
    id: "tools",
    label: "Tools",
    icon: <LuWrench className="w-3.5 h-3.5 text-cyan-600" />,
    defaultMode: "url",
    urlPlaceholder: "https://developer-tool.io",
    urlHint: "Web app, extension, or developer utility link",
    fileLabel: "Upload Tool Package / Binary",
    fileAccept: ".zip,.exe,.dmg,.pkg",
    fileHint: "Tool package or installer (Max 50MB)",
  },
];

export const MAX_TAGS = 4;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
