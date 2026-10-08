import {
  useState,
  useRef,
  useEffect,
  useMemo,
  type FormEvent,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type JSX,
} from "react";
import {
  FiLink,
  FiUploadCloud,
  FiFile,
  FiX,
  FiCheckCircle,
  FiBook,
  FiVideo,
  FiCode,
  FiFolder,
  FiImage,
  FiBold,
  FiItalic,
  FiList,
  FiMaximize2,
  FiMinimize2,
  FiChevronDown,
  FiGlobe,
  FiHash,
  FiLock,
  FiLayers,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { LuGraduationCap, LuWrench } from "react-icons/lu";
import { Modal, Button, Avatar, Tooltip } from "@/components/common";
import { useAuthStore } from "@/stores/useAuthStore";
import { getTags, type Tag } from "@/features/articles/api/tagApi";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils/cn";
import { createResource, previewLink, addResourcePart } from "../api/resources.api";
import {
  ResourceAccessType,
  type ResourceDetail,
} from "@/types/resources.types";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export interface NewPartDraft {
  id: string;
  title: string;
  description?: string;
  accessType: 0 | 1;
  contentUrl?: string;
  partFile?: File | null;
}

export type ResourceCategoryType =
  | "courses"
  | "documentation"
  | "books"
  | "videos"
  | "repositories"
  | "tools";

const CATEGORY_NAMES: Record<ResourceCategoryType, string> = {
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

export interface AddResourceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess?: (resource: ResourceDetail) => void;
  initialCategory?: string;
}

interface CategoryConfig {
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

const CATEGORIES: CategoryConfig[] = [
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

export function AddResourceModal({
  open,
  onClose,
  onSubmitSuccess,
  initialCategory = "documentation",
}: AddResourceModalProps): JSX.Element | null {
  const user = useAuthStore((state) => state.user);

  const initialCatSafe: ResourceCategoryType =
    initialCategory !== "all" && CATEGORIES.some((c) => c.id === initialCategory)
      ? (initialCategory as ResourceCategoryType)
      : "documentation";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [category, setCategory] = useState<ResourceCategoryType>(initialCatSafe);
  const [uploadMode, setUploadMode] = useState<UploadMode>(
    CATEGORIES.find((c) => c.id === initialCatSafe)?.defaultMode ?? "url",
  );
  const [title, setTitle] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const MAX_TAGS = 4;
  const tagContainerRef = useRef<HTMLDivElement>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState<boolean>(false);
  const [highlightedTagIndex, setHighlightedTagIndex] = useState<number>(-1);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Chapters / Sub-parts State
  const [parts, setParts] = useState<NewPartDraft[]>([]);
  const [isAddingPart, setIsAddingPart] = useState<boolean>(false);
  const [partTitle, setPartTitle] = useState<string>("");
  const [partDescription, setPartDescription] = useState<string>("");
  const [partAccessType, setPartAccessType] = useState<0 | 1>(1);
  const [partUrl, setPartUrl] = useState<string>("");
  const [partFile, setPartFile] = useState<File | null>(null);
  const partFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch available tags only when modal is open
  useEffect(() => {
    if (!open) return;

    let isSubscribed = true;
    async function loadTags(): Promise<void> {
      try {
        const data = await getTags({ pageSize: 50 });
        if (isSubscribed && Array.isArray(data)) {
          setAvailableTags(data);
        }
      } catch {
        // Silently handle
      }
    }
    void loadTags();
    return () => {
      isSubscribed = false;
    };
  }, [open]);

  // Close tag suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (tagContainerRef.current && !tagContainerRef.current.contains(e.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isTagLimitReached = tags.length >= MAX_TAGS;

  const tagSuggestions = useMemo(() => {
    const q = tagInput.trim().toLowerCase();
    const unselected = availableTags.filter(
      (t) => !tags.some((selected) => selected.toLowerCase() === t.name.toLowerCase()),
    );
    if (!q) return unselected.slice(0, 6);
    return unselected.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 6);
  }, [tagInput, availableTags, tags]);

  const handleAddTag = (tagNameToAdd?: string): void => {
    const cleanName = (tagNameToAdd ?? tagInput).trim().replace(/^#/, "");
    if (!cleanName) return;
    if (isTagLimitReached) {
      toast.error(`Maximum ${MAX_TAGS} tags reached`);
      return;
    }
    if (tags.some((t) => t.toLowerCase() === cleanName.toLowerCase())) {
      toast.error("Tag already added");
      return;
    }
    setTags((prev) => [...prev, cleanName]);
    setTagInput("");
    setIsTagDropdownOpen(false);
    setHighlightedTagIndex(-1);
  };

  const handleRemoveTag = (tagToRemove: string): void => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const currentConfig = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];

  // Category switch: updates category and automatically sets recommended upload mode
  const handleCategorySelect = (newCat: ResourceCategoryType): void => {
    setCategory(newCat);
    const config = CATEGORIES.find((c) => c.id === newCat);
    if (config) {
      setUploadMode(config.defaultMode);
    }
    setCategoryDropdownOpen(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selected = files[0];
      setCoverImageFile(selected);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setCoverImage(event.target.result);
        }
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handlePreviewFetch = async (targetUrl: string): Promise<void> => {
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) return;
    try {
      const parsed = new URL(cleanUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) return;
    } catch {
      return;
    }

    setIsPreviewLoading(true);
    try {
      const res = await previewLink(cleanUrl);
      if (res.data) {
        if (!title.trim() && res.data.title) {
          setTitle(res.data.title);
        }
        if (!description.trim() && res.data.description) {
          setDescription(res.data.description);
        }
      }
    } catch {
      // Ignore background preview scraping errors
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Text formatting helpers for daily.dev style toolbar
  const insertFormatting = (prefix: string, suffix: string = ""): void => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = description;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const nextText = text.substring(0, start) + replacement + text.substring(end);
    setDescription(nextText);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected.length || 4),
      );
    }, 0);
  };

  const handleReset = (): void => {
    setTitle("");
    setUrl("");
    setFile(null);
    setCoverImage(null);
    setCoverImageFile(null);
    setDescription("");
    setTags([]);
    setTagInput("");
    setParts([]);
    setIsAddingPart(false);
    setPartTitle("");
    setPartDescription("");
    setPartAccessType(1);
    setPartUrl("");
    setPartFile(null);
    setIsTagDropdownOpen(false);
    setCategoryDropdownOpen(false);
    setIsExpanded(false);
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (partFileInputRef.current) partFileInputRef.current.value = "";
  };

  const handleAddPartDraft = (): void => {
    if (!partTitle.trim()) {
      toast.error("Please enter a title for the chapter");
      return;
    }
    if (partAccessType === 1) {
      if (!partUrl.trim()) {
        toast.error("Please provide a link URL for this chapter");
        return;
      }
      try {
        const parsed = new URL(partUrl.trim());
        if (!["http:", "https:"].includes(parsed.protocol)) {
          toast.error("URL must begin with http:// or https://");
          return;
        }
      } catch {
        toast.error("Please enter a valid web URL for the chapter");
        return;
      }
    } else {
      if (!partFile) {
        toast.error("Please select or drop a file for this chapter");
        return;
      }
    }

    const newPart: NewPartDraft = {
      id: `part-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: partTitle.trim(),
      description: partDescription.trim() || undefined,
      accessType: partAccessType,
      contentUrl: partAccessType === 1 ? partUrl.trim() : undefined,
      partFile: partAccessType === 0 ? partFile : null,
    };

    setParts((prev) => [...prev, newPart]);
    setPartTitle("");
    setPartDescription("");
    setPartUrl("");
    setPartFile(null);
    setIsAddingPart(false);
    if (partFileInputRef.current) partFileInputRef.current.value = "";
  };

  const handleRemovePart = (partId: string): void => {
    setParts((prev) => prev.filter((p) => p.id !== partId));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title for the resource");
      return;
    }

    if (uploadMode === "url") {
      if (!url.trim()) {
        toast.error("Please provide the resource URL");
        return;
      }
      try {
        const parsed = new URL(url.trim());
        if (!["http:", "https:"].includes(parsed.protocol)) {
          toast.error("URL must begin with http:// or https://");
          return;
        }
      } catch {
        toast.error("Please enter a valid web URL");
        return;
      }
    } else {
      if (!file) {
        toast.error("Please select or drop a file to upload");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const categoryName = CATEGORY_NAMES[category] ?? "Documentation";
      const accessType =
        uploadMode === "file"
          ? ResourceAccessType.FileUpload
          : ResourceAccessType.ExternalLink;

      // 1. Create parent resource
      const response = await createResource({
        title: title.trim(),
        description: description.trim(),
        category: categoryName,
        accessType,
        tags: tags.length > 0 ? tags : [categoryName.toLowerCase()],
        externalUrl: uploadMode === "url" ? url.trim() : null,
        logoFile: coverImageFile,
        resourceFile: uploadMode === "file" ? file : null,
      });

      const createdResourceId = response.data?.id;

      // 2. Upload any chapters / modules
      if (parts.length > 0 && createdResourceId) {
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          try {
            await addResourcePart(createdResourceId, {
              title: p.title,
              description: p.description,
              accessType: p.accessType,
              contentUrl: p.accessType === 1 ? p.contentUrl : undefined,
              partFile: p.accessType === 0 ? p.partFile : null,
              sequenceOrder: i + 1,
            });
          } catch {
            // Non-critical individual part failure logging
          }
        }
      }

      onSubmitSuccess?.(response.data);
      toast.success(
        parts.length > 0
          ? `Resource & ${parts.length} chapter${parts.length > 1 ? "s" : ""} shared!`
          : "Resource shared with the community!",
      );
      handleReset();
      onClose();
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(
        error,
        "Failed to post resource. Please try again.",
      );
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isFormValid =
    title.trim().length > 0 &&
    (uploadMode === "url" ? url.trim().length > 0 : file !== null);

  return (
    <Modal
      open={open}
      onClose={() => {
        handleReset();
        onClose();
      }}
      size={isExpanded ? "full" : "xl"}
      showCloseButton={false}
      className={cn(
        "p-0 overflow-hidden bg-white shadow-2xl transition-all duration-200",
        isExpanded
          ? "w-screen h-screen max-w-none max-h-none rounded-none border-0"
          : "rounded-2xl border border-border",
      )}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full w-full">
        {/* Top Header Bar (daily.dev style) */}
        <div
          className={cn(
            "flex items-center justify-between px-3.5 sm:px-5 pt-3 sm:pt-4 pb-2 select-none border-b border-border/40 shrink-0",
            isExpanded && "px-4 sm:px-8 pt-4 sm:pt-5",
          )}
        >
          {/* Left: User Avatar + Category Dropdown Picker */}
          <div className="relative flex items-center gap-2 sm:gap-2.5">
            <Avatar
              name={
                [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
                user?.userName ||
                user?.username ||
                "User"
              }
              src={user?.avatarUrl || undefined}
              size="sm"
              href={null}
              className="ring-1 ring-border"
            />

            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 text-text font-semibold text-xs border border-border/60 transition-colors"
              >
                <span>{currentConfig.icon}</span>
                <span>{currentConfig.label}</span>
                <FiChevronDown className="w-3 h-3 text-text/50" />
              </button>

              {/* Category Popover Menu */}
              {categoryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setCategoryDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-1.5 z-40 w-52 bg-white border border-border rounded-xl shadow-lg p-1.5 space-y-0.5">
                    <p className="text-[10px] font-bold text-text/40 uppercase tracking-wider px-2 py-1">
                      Choose Category
                    </p>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={cn(
                          "flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors",
                          category === cat.id
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-text/80 hover:bg-slate-100 hover:text-text",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {cat.icon}
                          <span>{cat.label}</span>
                        </div>
                        <span className="text-[10px] text-text/40 uppercase">
                          {cat.defaultMode}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-1 text-text/50">
            <Tooltip content={isExpanded ? "Exit full screen" : "Expand full screen"}>
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-label={isExpanded ? "Collapse view" : "Expand full screen"}
                className="p-1.5 rounded-md hover:text-text hover:bg-slate-100 transition-colors"
              >
                {isExpanded ? (
                  <FiMinimize2 className="w-4 h-4" />
                ) : (
                  <FiMaximize2 className="w-4 h-4" />
                )}
              </button>
            </Tooltip>

            <Tooltip content="Close (Esc)">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                aria-label="Close modal"
                className="p-1.5 rounded-md hover:text-text hover:bg-slate-100 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          className={cn(
            "flex-1 overflow-y-auto px-3.5 sm:px-6 py-3 sm:py-4 space-y-3 slim-scrollbar",
            isExpanded && "max-w-4xl mx-auto w-full px-4 sm:px-8 py-5 sm:py-8 space-y-5",
          )}
        >
          {/* Title Input (Frameless, bold) */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full text-xl sm:text-2xl md:text-3xl font-extrabold text-text bg-transparent border-none outline-none tracking-tight focus:ring-0"
            autoFocus
          />

          {/* Cover Image Action & Preview */}
          <div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />

            {!coverImage ? (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-dashed border-border hover:border-primary/50 text-xs font-semibold text-text/60 hover:text-primary transition-colors bg-slate-50/60 hover:bg-slate-50"
              >
                <FiImage className="w-3.5 h-3.5" />
                <span>Add cover</span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-border max-h-44 group bg-slate-100">
                <img
                  src={coverImage}
                  alt="Resource Cover"
                  className="w-full h-full object-cover"
                />
                <Tooltip content="Remove cover image" position="left">
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverImageFile(null);
                      if (coverInputRef.current) coverInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                    aria-label="Remove cover image"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>

          {/* DYNAMIC UPLOAD AREA (URL vs File Upload tailored by Category) */}
          <div className="p-3.5 rounded-xl border border-border bg-slate-50/70 space-y-2.5 transition-all">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text/80 flex items-center gap-1.5">
                {uploadMode === "url" ? (
                  <>
                    <FiGlobe className="w-3.5 h-3.5 text-primary" />
                    <span>Resource Link ({currentConfig.label})</span>
                  </>
                ) : (
                  <>
                    <FiUploadCloud className="w-3.5 h-3.5 text-primary" />
                    <span>{currentConfig.fileLabel}</span>
                  </>
                )}
              </span>

              {/* Mode Switcher pill */}
              <div className="flex items-center bg-white border border-border rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all",
                    uploadMode === "url"
                      ? "bg-primary text-white shadow-2xs"
                      : "text-text/60 hover:text-text",
                  )}
                >
                  <FiLink className="w-3 h-3" />
                  <span>URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all",
                    uploadMode === "file"
                      ? "bg-primary text-white shadow-2xs"
                      : "text-text/60 hover:text-text",
                  )}
                >
                  <FiUploadCloud className="w-3 h-3" />
                  <span>File</span>
                </button>
              </div>
            </div>

            {/* Mode 1: URL Input */}
            {uploadMode === "url" && (
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-text/40">
                    <FiLink className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onBlur={() => void handlePreviewFetch(url)}
                    placeholder={currentConfig.urlPlaceholder}
                    className="w-full pl-9 pr-16 py-2 bg-white text-xs sm:text-sm font-medium border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-text/30"
                  />
                  {isPreviewLoading && (
                    <span className="absolute right-3 text-[10px] text-primary animate-pulse font-medium">
                      Scraping...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text/50">{currentConfig.urlHint}</p>
              </div>
            )}

            {/* Mode 2: Drag & Drop File Upload */}
            {uploadMode === "file" && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={currentConfig.fileAccept}
                  className="hidden"
                  onChange={handleFileChange}
                />

                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-slate-50/50",
                    )}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-1.5 shadow-2xs">
                      <FiUploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-text">
                      Drag & drop your file here, or{" "}
                      <span className="text-primary hover:underline">browse</span>
                    </p>
                    <p className="text-[10px] text-text/50 mt-0.5">{currentConfig.fileHint}</p>
                  </div>
                ) : (
                  <div className="bg-white border border-border rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FiFile className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text truncate">{file.name}</p>
                        <p className="text-[10px] text-text/50">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <FiCheckCircle className="w-3.5 h-3.5" /> Attached
                      </span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="p-1 text-text/40 hover:text-rose-600 rounded transition-colors"
                        aria-label="Remove attached file"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CHAPTERS / MODULES BUILDER */}
          <div className="p-3.5 rounded-xl border border-border bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiLayers className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-text">Chapters & Modules</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-text/60">
                  {parts.length}
                </span>
              </div>

              {!isAddingPart && (
                <button
                  type="button"
                  onClick={() => setIsAddingPart(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  <span>Add Chapter</span>
                </button>
              )}
            </div>

            {/* List of already added parts */}
            {parts.length > 0 && (
              <div className="space-y-2">
                {parts.map((p, index) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg border border-border bg-white flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text truncate">{p.title}</p>
                        <p className="text-[10px] text-text/50 truncate">
                          {p.accessType === 1
                            ? `Link: ${p.contentUrl || ""}`
                            : `File: ${p.partFile?.name || "Attached"} (${formatFileSize(p.partFile?.size || 0)})`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePart(p.id)}
                      className="p-1 text-text/40 hover:text-rose-600 rounded transition-colors"
                      aria-label={`Remove chapter ${p.title}`}
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Add Part Form */}
            {isAddingPart && (
              <div className="p-3 rounded-lg border border-primary/20 bg-white space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text">
                    New Chapter / Part #{parts.length + 1}
                  </span>
                  {/* Mode switcher for this part */}
                  <div className="flex items-center bg-slate-100 border border-border rounded-md p-0.5">
                    <button
                      type="button"
                      onClick={() => setPartAccessType(1)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                        partAccessType === 1
                          ? "bg-primary text-white shadow-2xs"
                          : "text-text/60 hover:text-text",
                      )}
                    >
                      Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartAccessType(0)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                        partAccessType === 0
                          ? "bg-primary text-white shadow-2xs"
                          : "text-text/60 hover:text-text",
                      )}
                    >
                      File
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={partTitle}
                  onChange={(e) => setPartTitle(e.target.value)}
                  placeholder="Chapter title (e.g. Chapter 1: Introduction)..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />

                {partAccessType === 1 ? (
                  <input
                    type="url"
                    value={partUrl}
                    onChange={(e) => setPartUrl(e.target.value)}
                    placeholder="Chapter URL (https://...)"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                ) : (
                  <div>
                    <input
                      ref={partFileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) setPartFile(files[0]);
                      }}
                    />
                    {!partFile ? (
                      <button
                        type="button"
                        onClick={() => partFileInputRef.current?.click()}
                        className="w-full py-2 px-3 border border-dashed border-border rounded-md text-xs text-text/60 hover:text-primary hover:border-primary/50 text-center transition-colors bg-slate-50"
                      >
                        Choose file attachment (PDF, document, zip)
                      </button>
                    ) : (
                      <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-border rounded-md text-xs">
                        <span className="truncate text-text font-medium">{partFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setPartFile(null)}
                          className="text-text/40 hover:text-rose-600 p-0.5"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  value={partDescription}
                  onChange={(e) => setPartDescription(e.target.value)}
                  placeholder="Short description / summary (optional)..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingPart(false);
                      setPartTitle("");
                      setPartDescription("");
                      setPartUrl("");
                      setPartFile(null);
                    }}
                    className="text-xs py-1 h-7"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAddPartDraft}
                    className="text-xs py-1 h-7"
                  >
                    Add Chapter
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Tags Input Section (ArticleEditor style, placed right before content) */}
          <div ref={tagContainerRef} className="space-y-2 relative pt-1">
            <div
              className={cn(
                "flex items-center justify-between gap-2 border rounded-xl px-3.5 py-2 transition-all",
                isTagLimitReached
                  ? "bg-slate-100/90 border-slate-200 cursor-not-allowed select-none"
                  : "bg-slate-50/70 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/60",
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isTagLimitReached ? (
                  <FiLock
                    className="w-3.5 h-3.5 text-slate-400 shrink-0"
                    title="Tag limit reached (4 of 4)"
                  />
                ) : (
                  <FiHash className="w-3.5 h-3.5 text-text/40 shrink-0" />
                )}
                <input
                  type="text"
                  value={isTagLimitReached ? "" : tagInput}
                  onFocus={() => {
                    if (!isTagLimitReached && tagSuggestions.length > 0) {
                      setIsTagDropdownOpen(true);
                    }
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (isTagLimitReached) return;
                    setTagInput(e.target.value);
                    setIsTagDropdownOpen(true);
                    setHighlightedTagIndex(-1);
                  }}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (isTagLimitReached) {
                      e.preventDefault();
                      return;
                    }
                    if (e.key === "ArrowDown") {
                      if (tagSuggestions.length > 0) {
                        e.preventDefault();
                        setIsTagDropdownOpen(true);
                        setHighlightedTagIndex((prev) =>
                          prev < tagSuggestions.length - 1 ? prev + 1 : 0,
                        );
                      }
                    } else if (e.key === "ArrowUp") {
                      if (tagSuggestions.length > 0) {
                        e.preventDefault();
                        setIsTagDropdownOpen(true);
                        setHighlightedTagIndex((prev) =>
                          prev > 0 ? prev - 1 : tagSuggestions.length - 1,
                        );
                      }
                    } else if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      if (highlightedTagIndex >= 0 && tagSuggestions[highlightedTagIndex]) {
                        handleAddTag(tagSuggestions[highlightedTagIndex].name);
                      } else {
                        handleAddTag();
                      }
                    } else if (e.key === "Escape") {
                      setIsTagDropdownOpen(false);
                      setHighlightedTagIndex(-1);
                    }
                  }}
                  placeholder={
                    isTagLimitReached
                      ? "Maximum 4 tags reached (locked)"
                      : "Type to search or add tags (e.g. frontend, react)..."
                  }
                  disabled={isTagLimitReached}
                  readOnly={isTagLimitReached}
                  className={cn(
                    "w-full bg-transparent text-xs sm:text-sm border-none outline-none focus:ring-0",
                    isTagLimitReached
                      ? "cursor-not-allowed text-slate-400"
                      : "placeholder:text-text/40",
                  )}
                />
              </div>

              <span
                className={cn(
                  "text-[11px] font-mono font-medium shrink-0",
                  isTagLimitReached ? "text-amber-600 font-bold" : "text-text/40",
                )}
              >
                {tags.length}/{MAX_TAGS}
              </span>
            </div>

            {/* Suggestions Dropdown */}
            {!isTagLimitReached && isTagDropdownOpen && tagSuggestions.length > 0 && (
              <ul
                role="listbox"
                aria-label="Tag suggestions"
                className="absolute top-full left-0 mt-1 w-full bg-white border border-border rounded-xl shadow-lg z-30 py-1 max-h-48 overflow-y-auto slim-scrollbar"
              >
                {tagSuggestions.map((tag, index) => {
                  const isHighlighted = index === highlightedTagIndex;
                  return (
                    <li key={tag.id ?? tag.name} role="option" aria-selected={isHighlighted}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleAddTag(tag.name);
                        }}
                        onMouseEnter={() => setHighlightedTagIndex(index)}
                        className={cn(
                          "w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer",
                          isHighlighted
                            ? "bg-indigo-50 text-indigo-600 font-semibold"
                            : "text-text hover:bg-slate-50",
                        )}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="text-indigo-500 font-bold">#</span>
                          <span>{tag.name}</span>
                        </span>
                        {tag.usageCount !== undefined && tag.usageCount > 0 && (
                          <span className="text-[10px] text-text/40 shrink-0 ml-2">
                            {tag.usageCount} {tag.usageCount === 1 ? "post" : "posts"}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Selected Tag Chips (ArticleEditor style) */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-600 transition-colors p-0.5"
                      aria-label={`Remove tag ${t}`}
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content / Thoughts Textarea */}
          <textarea
            ref={textareaRef}
            rows={isExpanded ? 10 : 4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share your thoughts, overview, or what makes this resource great..."
            className="w-full text-sm placeholder:text-text/30 bg-transparent border-none outline-none resize-none leading-relaxed focus:ring-0 pt-2"
          />
        </div>

        {/* Bottom Toolbar & Action Bar (daily.dev style) */}
        <div
          className={cn(
            "px-3.5 sm:px-5 py-2.5 sm:py-3 border-t border-border bg-slate-50/60 flex items-center justify-between gap-2 select-none shrink-0",
            isExpanded && "px-4 sm:px-8 py-3.5 sm:py-4",
          )}
        >
          {/* Left Toolbar Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            {/* Free form / category indicator pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-white text-xs font-semibold text-text shadow-2xs">
              <span>{currentConfig.icon}</span>
              <span className="capitalize">{category}</span>
            </div>

            <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

            {/* Quick action buttons */}
            <Tooltip content="Upload cover image">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                aria-label="Upload cover image"
                className="p-1.5 rounded-lg text-text/60 hover:text-text hover:bg-slate-200/60 transition-colors"
              >
                <FiImage className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip content="Switch to URL Link mode">
              <button
                type="button"
                onClick={() => setUploadMode("url")}
                aria-label="Insert URL"
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  uploadMode === "url"
                    ? "text-primary bg-primary/10"
                    : "text-text/60 hover:text-text hover:bg-slate-200/60",
                )}
              >
                <FiLink className="w-4 h-4" />
              </button>
            </Tooltip>

            {/* Markdown Text Formatting icons - hidden on tiny screens to avoid overflow */}
            <div className="hidden sm:flex items-center gap-1">
              <Tooltip content="Bold text (**text**)">
                <button
                  type="button"
                  onClick={() => insertFormatting("**", "**")}
                  aria-label="Bold text"
                  className="p-1.5 rounded-lg text-text/60 hover:text-text hover:bg-slate-200/60 transition-colors font-bold"
                >
                  <FiBold className="w-4 h-4" />
                </button>
              </Tooltip>

              <Tooltip content="Italic text (*text*)">
                <button
                  type="button"
                  onClick={() => insertFormatting("*", "*")}
                  aria-label="Italic text"
                  className="p-1.5 rounded-lg text-text/60 hover:text-text hover:bg-slate-200/60 transition-colors italic"
                >
                  <FiItalic className="w-4 h-4" />
                </button>
              </Tooltip>

              <Tooltip content="Bullet list (- item)">
                <button
                  type="button"
                  onClick={() => insertFormatting("\n- ")}
                  aria-label="Bullet list"
                  className="p-1.5 rounded-lg text-text/60 hover:text-text hover:bg-slate-200/60 transition-colors"
                >
                  <FiList className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Right Action: Post button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                handleReset();
                onClose();
              }}
              disabled={isSubmitting}
              className="text-xs px-2.5 sm:px-3"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={!isFormValid || isSubmitting}
              className="px-4 sm:px-5 font-semibold text-xs shadow-sm"
            >
              Post
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
