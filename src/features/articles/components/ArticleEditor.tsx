import { useState, useEffect, useMemo, useRef, type JSX } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "@/shared/hooks/useToast";
import { getApiErrorMessage } from "@/shared/lib/utils/apiError";
import { insertMarkdown as applyMarkdown } from "@/shared/lib/utils/markdown";
import { articleSchema, type ArticleFormData } from "@/features/articles/schemas/articleSchema";
import { EditorHeader } from "./article-editor/EditorHeader";
import { CoverImageCard } from "./article-editor/CoverImageCard";
import { TagInput } from "./article-editor/TagInput";
import { MarkdownToolbar } from "./article-editor/MarkdownToolbar";
import { EditorStatusBar } from "./article-editor/EditorStatusBar";
import { PublishChecklist } from "./article-editor/PublishChecklist";
import { ArticlePreview } from "./article-editor/ArticlePreview";
import { PublicationSidebar } from "./article-editor/PublicationSidebar";

export interface ArticleEditorProps {
  initialData?: Partial<ArticleFormData>;
  isEditing?: boolean;
  onSaveDraft?: (data: ArticleFormData, coverImageFile?: File | null) => Promise<void>;
  onPublish?: (data: ArticleFormData, coverImageFile?: File | null) => Promise<void>;
}

export function ArticleEditor({
  initialData,
  isEditing = false,
  onSaveDraft,
  onPublish,
}: ArticleEditorProps): JSX.Element {
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>(initialData?.coverImage ?? "");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    return () => {
      if (coverImagePreview && coverImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  const [prevInitialCover, setPrevInitialCover] = useState(initialData?.coverImage);
  if (initialData?.coverImage !== prevInitialCover) {
    setPrevInitialCover(initialData?.coverImage);
    if (!coverImageFile) {
      setCoverImagePreview(initialData?.coverImage ?? "");
    }
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      excerpt: initialData?.excerpt ?? "",
      content: initialData?.content ?? "",
      coverImage: initialData?.coverImage ?? "",
      coverImageAlt: initialData?.coverImageAlt ?? "",
      tagNames: initialData?.tagNames ?? [],
      status: initialData?.status ?? "draft",
      // scheduledFor: initialData?.scheduledFor ?? "",
      visibility: initialData?.visibility ?? "public",
      series: initialData?.series ?? "",
      readingTime: initialData?.readingTime ?? 0,
    },
  });

  const titleValue = useWatch({ control, name: "title" }) || "";
  const contentValue = useWatch({ control, name: "content" }) || "";
  const coverImageValue = useWatch({ control, name: "coverImage" }) || "";
  const watchedTagNames = useWatch({ control, name: "tagNames" });
  const tagNamesValue = useMemo(() => watchedTagNames || [], [watchedTagNames]);
  const visibilityValue = useWatch({ control, name: "visibility" }) || "public";
  const excerptValue = useWatch({ control, name: "excerpt" }) || "";
  const statusValue = useWatch({ control, name: "status" }) || "draft";

  // Auto-slugify title if slug is not manually altered
  useEffect(() => {
    if (!initialData?.slug && titleValue) {
      const generatedSlug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [titleValue, setValue, initialData]);

  // Word & Character count calculations
  const characterCount = contentValue.length;
  const wordCount = contentValue.trim() ? contentValue.trim().split(/\s+/).length : 0;
  const computedReadingTime = Math.ceil(wordCount / 200);

  // Sync computed reading time into the form payload
  useEffect(() => {
    setValue("readingTime", computedReadingTime, { shouldValidate: false });
  }, [computedReadingTime, setValue]);

  // Before you publish checklist calculation (2/4, 3/4, 4/4)
  const checklist = [
    { label: "Add a title", isMet: titleValue.trim().length >= 3 },
    { label: "Add at least one tag", isMet: tagNamesValue.length >= 1 },
    { label: "Add a cover image", isMet: Boolean(coverImageValue.trim()) },
    { label: "Write at least 300 characters", isMet: characterCount >= 300 },
  ];

  // Insert markdown syntax into content textarea at current cursor position
  const insertMarkdown = (before: string, after: string = "") =>
    applyMarkdown(
      textareaRef.current,
      (value) => setValue("content", value, { shouldValidate: true }),
      before,
      after,
    );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Image size must be less than ${maxMb}MB`);
      return;
    }

    if (coverImagePreview && coverImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setCoverImageFile(file);
    setCoverImagePreview(previewUrl);
    setValue("coverImage", file.name, { shouldValidate: true });
    e.target.value = "";
  };

  const handleRemoveCoverImage = (): void => {
    if (coverImagePreview && coverImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImageFile(null);
    setCoverImagePreview("");
    setValue("coverImage", "", { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveDraftHandler = async (data: ArticleFormData): Promise<void> => {
    setIsSaving(true);
    try {
      if (onSaveDraft) {
        await onSaveDraft({ ...data, status: "draft" }, coverImageFile);
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to save draft"));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishHandler = async (data: ArticleFormData): Promise<void> => {
    if (data.status === "draft") {
      await handleSaveDraftHandler(data);
      return;
    }
    setIsPublishing(true);
    try {
      if (onPublish) {
        await onPublish(data, coverImageFile);
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to publish article"));
    } finally {
      setIsPublishing(false);
    }
  };

  const { ref: registerContentRef, ...contentRegisterRest } = register("content");

  return (
    <div
      className={`w-full font-inter bg-background text-text min-h-screen ${isFullscreen ? "fixed inset-0 z-50 overflow-y-auto bg-white p-6" : "p-4 sm:p-6"}`}
    >
      <div className="max-w-360 mx-auto space-y-5">
        {/* Top Header Bar */}
        <EditorHeader
          isEditing={isEditing}
          statusValue={statusValue}
          isSaving={isSaving}
          isPublishing={isPublishing}
          onSaveDraft={handleSubmit(handleSaveDraftHandler)}
          onPublish={handleSubmit(handlePublishHandler)}
        />

        {/* 3-Column Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* COLUMN 1: LEFT EDITOR (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Cover Image Block */}
            <CoverImageCard
              fileInputRef={fileInputRef}
              coverImagePreview={coverImagePreview}
              coverImageFile={coverImageFile}
              handleFileChange={handleFileChange}
              handleRemoveCoverImage={handleRemoveCoverImage}
            />

            {/* Title & Tags Card */}
            <div className="bg-white border border-border rounded-xl p-4 shadow-2xs space-y-3">
              {/* Article Title Input */}
              <div>
                <input
                  type="text"
                  placeholder="Enter your article title..."
                  {...register("title")}
                  className="w-full text-xl sm:text-2xl font-bold text-text border-none outline-none focus:ring-0 bg-transparent py-1"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="h-px bg-border/60" />

              {/* Tags Input */}
              <TagInput
                tags={tagNamesValue}
                onChange={(tags) => setValue("tagNames", tags, { shouldValidate: true })}
              />
            </div>

            {/* Formatting Toolbar & Writing Textarea */}
            <div className="bg-white border border-border rounded-xl shadow-2xs overflow-hidden flex flex-col">
              {/* Toolbar */}
              <MarkdownToolbar insertMarkdown={insertMarkdown} />

              {/* Textarea */}
              <div className="p-4 flex-1 min-h-90">
                <textarea
                  {...contentRegisterRest}
                  ref={(e) => {
                    registerContentRef(e);
                    textareaRef.current = e;
                  }}
                  rows={14}
                  placeholder="Start writing your story..."
                  className="w-full h-full p-1 bg-transparent text-text font-inter text-sm leading-relaxed outline-none border-none focus:ring-0 resize-y min-h-80"
                />
                {errors.content && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errors.content.message}</p>
                )}
              </div>

              {/* Footer status bar */}
              <EditorStatusBar
                wordCount={wordCount}
                characterCount={characterCount}
                computedReadingTime={computedReadingTime}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
              />
            </div>

            <PublishChecklist checklist={checklist} />
          </div>

          <ArticlePreview
            titleValue={titleValue}
            tagNamesValue={tagNamesValue}
            contentValue={contentValue}
            computedReadingTime={computedReadingTime}
            wordCount={wordCount}
          />

          <PublicationSidebar
            register={register}
            visibilityValue={visibilityValue}
            onVisibilityChange={(visibility) => setValue("visibility", visibility)}
            excerptValue={excerptValue}
          />
        </div>
      </div>
    </div>
  );
}

export default ArticleEditor;
