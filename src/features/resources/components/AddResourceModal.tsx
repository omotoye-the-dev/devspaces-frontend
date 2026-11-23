import { useMemo, useState, useRef, type FormEvent, type ChangeEvent, type JSX } from "react";
import { Modal } from "@/shared/ui";
import { toast } from "@/shared/hooks/useToast";
import { cn } from "@/shared/lib/utils/cn";
import {
  createResource,
  previewLink,
  addResourcePart,
} from "@/features/resources/api/resources.api";
import {
  ResourceAccessType,
  type ResourceDetail,
} from "@/features/resources/types/resources.types";
import { getApiErrorMessage } from "@/shared/lib/utils/apiError";
import { insertMarkdown as applyMarkdown } from "@/shared/lib/utils/markdown";
import {
  CATEGORIES,
  CATEGORY_NAMES,
  type NewPartDraft,
  type ResourceCategoryType,
  type UploadMode,
} from "./add-resource/addResource.config";
import { AddResourceHeader } from "./add-resource/AddResourceHeader";
import { CoverImagePicker } from "./add-resource/CoverImagePicker";
import { UploadSourceSection } from "./add-resource/UploadSourceSection";
import { ChaptersBuilder } from "./add-resource/ChaptersBuilder";
import { ResourceTagInput } from "./add-resource/ResourceTagInput";
import { ComposerFooter } from "./add-resource/ComposerFooter";
import { useTags } from "@/features/articles/api/tagQueries";

export type {
  NewPartDraft,
  NewResourcePayload,
  ResourceCategoryType,
  UploadMode,
} from "./add-resource/addResource.config";

export interface AddResourceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess?: (resource: ResourceDetail) => void;
  initialCategory?: string;
}

export function AddResourceModal({
  open,
  onClose,
  onSubmitSuccess,
  initialCategory = "documentation",
}: AddResourceModalProps): JSX.Element | null {
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
  const [tags, setTags] = useState<string[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Chapters / Sub-parts State
  const [parts, setParts] = useState<NewPartDraft[]>([]);
  // Bumped on reset so child form sections (tag search, chapter draft) start fresh.
  const [formKey, setFormKey] = useState(0);

  // Available tags, fetched only when the modal is open (shared cache)
  const { data: tagsData } = useTags(50, open);
  const availableTags = useMemo(() => tagsData ?? [], [tagsData]);

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
  const insertFormatting = (prefix: string, suffix: string = ""): void =>
    applyMarkdown(textareaRef.current, setDescription, prefix, suffix);

  const handleReset = (): void => {
    setTitle("");
    setUrl("");
    setFile(null);
    setCoverImage(null);
    setCoverImageFile(null);
    setDescription("");
    setTags([]);
    setParts([]);
    setCategoryDropdownOpen(false);
    setIsExpanded(false);
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormKey((k) => k + 1);
  };

  const handleRemoveCover = (): void => {
    setCoverImage(null);
    setCoverImageFile(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleClose = (): void => {
    handleReset();
    onClose();
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
        uploadMode === "file" ? ResourceAccessType.FileUpload : ResourceAccessType.ExternalLink;

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
      const errorMessage = getApiErrorMessage(error, "Failed to post resource. Please try again.");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    title.trim().length > 0 && (uploadMode === "url" ? url.trim().length > 0 : file !== null);

  return (
    <Modal
      open={open}
      onClose={handleClose}
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
        <AddResourceHeader
          category={category}
          currentConfig={currentConfig}
          categoryDropdownOpen={categoryDropdownOpen}
          onCategoryDropdownOpenChange={setCategoryDropdownOpen}
          onCategorySelect={handleCategorySelect}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded((prev) => !prev)}
          onRequestClose={handleClose}
        />

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

          <CoverImagePicker
            coverInputRef={coverInputRef}
            coverImage={coverImage}
            handleCoverChange={handleCoverChange}
            onRemove={handleRemoveCover}
          />

          <UploadSourceSection
            uploadMode={uploadMode}
            onUploadModeChange={setUploadMode}
            currentConfig={currentConfig}
            url={url}
            onUrlChange={setUrl}
            onUrlBlur={() => void handlePreviewFetch(url)}
            isPreviewLoading={isPreviewLoading}
            fileInputRef={fileInputRef}
            file={file}
            onFileChange={setFile}
          />

          <ChaptersBuilder
            key={`chapters-${formKey}`}
            parts={parts}
            onAddPart={(part) => setParts((prev) => [...prev, part])}
            onRemovePart={handleRemovePart}
          />

          <ResourceTagInput
            key={`tags-${formKey}`}
            tags={tags}
            onChange={setTags}
            availableTags={availableTags}
          />

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

        <ComposerFooter
          isExpanded={isExpanded}
          category={category}
          currentConfig={currentConfig}
          coverInputRef={coverInputRef}
          uploadMode={uploadMode}
          onUploadModeChange={setUploadMode}
          insertFormatting={insertFormatting}
          onCancel={handleClose}
          isSubmitting={isSubmitting}
          isFormValid={isFormValid}
        />
      </form>
    </Modal>
  );
}
