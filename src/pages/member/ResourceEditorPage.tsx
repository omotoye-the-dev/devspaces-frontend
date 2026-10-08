import { useState, useEffect, type JSX, type ChangeEvent, type KeyboardEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiTrash2,
  FiPlus,
  FiEdit2,
  FiUpload,
  FiExternalLink,
  FiFile,
  FiLayers,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiEye,
} from "react-icons/fi";
import {
  Button,
  Input,
  Textarea,
  Modal,
  Skeleton,
  EmptyState,
} from "@/components/common";
import {
  getResourceById,
  updateResource,
  deleteResource,
  addResourcePart,
  updateResourcePart,
  deleteResourcePart,
} from "@/features/resources/api/resources.api";
import {
  isPartAFile,
  type ResourceDetail,
  type ResourcePart,
} from "@/types/resources.types";
import { toast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

const CATEGORIES = [
  "Documentation",
  "Course",
  "Repository",
  "Tool",
  "Article",
  "Book",
  "Library",
  "Cheatsheet",
  "Other",
];

export default function ResourceEditorPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("Documentation");
  const [accessType, setAccessType] = useState<number>(1); // 0 = File, 1 = Link
  const [externalUrl, setExternalUrl] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [resourceFile, setResourceFile] = useState<File | null>(null);

  // Sub-parts states
  const [parts, setParts] = useState<ResourcePart[]>([]);
  const [isPartModalOpen, setIsPartModalOpen] = useState<boolean>(false);
  const [editingPart, setEditingPart] = useState<ResourcePart | null>(null);
  const [partTitle, setPartTitle] = useState<string>("");
  const [partDescription, setPartDescription] = useState<string>("");
  const [partAccessType, setPartAccessType] = useState<number>(1);
  const [partContentUrl, setPartContentUrl] = useState<string>("");
  const [partFile, setPartFile] = useState<File | null>(null);
  const [partSequence, setPartSequence] = useState<number>(1);
  const [isSavingPart, setIsSavingPart] = useState<boolean>(false);

  // Part delete state
  const [partToDelete, setPartToDelete] = useState<ResourcePart | null>(null);
  const [isDeletingPart, setIsDeletingPart] = useState<boolean>(false);

  // Load resource data
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadResource(): Promise<void> {
      try {
        setIsLoading(true);
        const res = await getResourceById(id as string);
        if (cancelled) return;

        const data = res.data;
        setResource(data);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setCategory(data.category || "Documentation");
        setAccessType(
          typeof data.accessType === "number"
            ? data.accessType
            : data.accessType === "FileUpload"
              ? 0
              : 1,
        );
        setExternalUrl(data.externalUrl || "");
        setTags((data.tags || []).map((t) => (typeof t === "string" ? t : t.name)));
        setLogoPreview(data.logoUrl || null);
        setParts(data.parts || []);
      } catch (err: unknown) {
        if (cancelled) return;
        toast.error(getApiErrorMessage(err, "Failed to load resource details"));
        navigate("/profile");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadResource();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  // Handle Logo file pick
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Handle Resource file pick
  const handleResourceFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setResourceFile(file);
    }
  };

  // Tag management
  const handleAddTag = (): void => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string): void => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Save General Resource Details (PUT /api/resources/{id})
  const handleSaveDetails = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!id) return;
    if (!title.trim()) {
      toast.error("Resource title is required");
      return;
    }

    try {
      setIsSaving(true);
      await updateResource(id, {
        title: title.trim(),
        description: description.trim(),
        category,
        accessType,
        externalUrl: accessType === 1 ? externalUrl.trim() : null,
        tags,
        logoFile,
        resourceFile,
      });

      toast.success("Resource updated successfully!");
      // Refresh details
      const refreshed = await getResourceById(id);
      setResource(refreshed.data);
      setLogoFile(null);
      setResourceFile(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to update resource"));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Entire Resource (DELETE /api/resources/{id})
  const handleDeleteResource = async (): Promise<void> => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await deleteResource(id);
      toast.success("Resource deleted permanently");
      setShowDeleteModal(false);
      navigate("/profile");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to delete resource"));
      setIsDeleting(false);
    }
  };

  // Open modal for adding a new part
  const handleOpenAddPartModal = (): void => {
    setEditingPart(null);
    setPartTitle("");
    setPartDescription("");
    setPartAccessType(1);
    setPartContentUrl("");
    setPartFile(null);
    setPartSequence(parts.length + 1);
    setIsPartModalOpen(true);
  };

  // Open modal for editing an existing part
  const handleOpenEditPartModal = (part: ResourcePart): void => {
    setEditingPart(part);
    setPartTitle(part.title);
    setPartDescription(part.description || "");
    setPartAccessType(
      typeof part.accessType === "number"
        ? part.accessType
        : part.accessType === "FileUpload"
          ? 0
          : 1,
    );
    setPartContentUrl(part.contentUrl || "");
    setPartFile(null);
    setPartSequence(part.sequenceOrder);
    setIsPartModalOpen(true);
  };

  // Save Sub-Part (POST /api/resources/{id}/parts or PUT /api/resources/{id}/parts/{partId})
  const handleSavePart = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!id) return;
    if (!partTitle.trim()) {
      toast.error("Sub-part title is required");
      return;
    }

    try {
      setIsSavingPart(true);

      if (editingPart) {
        // Update existing part (PUT /api/resources/{id}/parts/{partId})
        await updateResourcePart(id, editingPart.partId, {
          title: partTitle.trim(),
          description: partDescription.trim() || undefined,
          accessType: partAccessType,
          sequenceOrder: partSequence,
          contentUrl: partAccessType === 1 ? partContentUrl.trim() : undefined,
          partFile: partAccessType === 0 ? partFile : null,
        });
        toast.success("Sub-part updated successfully");
      } else {
        // Create new part (POST /api/resources/{id}/parts)
        await addResourcePart(id, {
          title: partTitle.trim(),
          description: partDescription.trim() || undefined,
          accessType: partAccessType,
          sequenceOrder: partSequence,
          contentUrl: partAccessType === 1 ? partContentUrl.trim() : undefined,
          partFile: partAccessType === 0 ? partFile : null,
        });
        toast.success("Sub-part added successfully");
      }

      setIsPartModalOpen(false);
      // Reload parts
      const refreshed = await getResourceById(id);
      setParts(refreshed.data.parts || []);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to save sub-part"));
    } finally {
      setIsSavingPart(false);
    }
  };

  // Delete Sub-Part (DELETE /api/resources/{id}/parts/{partId})
  const handleConfirmDeletePart = async (): Promise<void> => {
    if (!id || !partToDelete) return;

    try {
      setIsDeletingPart(true);
      await deleteResourcePart(id, partToDelete.partId);
      toast.success("Sub-part removed");
      setPartToDelete(null);

      // Reload parts
      const refreshed = await getResourceById(id);
      setParts(refreshed.data.parts || []);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to delete sub-part"));
    } finally {
      setIsDeletingPart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        <Skeleton variant="rounded" className="h-10 w-48 rounded-xl" />
        <Skeleton variant="rounded" className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="space-y-1">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text/60 hover:text-primary transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Edit Resource
          </h1>
          <p className="text-xs sm:text-sm text-text/60">
            Manage resource details, links, media, and sub-parts / chapters.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {id && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiEye className="w-4 h-4" />}
              onClick={() => navigate(`/resources/${id}`)}
              className="text-xs font-semibold"
            >
              Public View
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            leftIcon={<FiTrash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteModal(true)}
            className="text-xs font-semibold"
          >
            Delete Resource
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Resource Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveDetails}
            className="bg-white border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-base font-bold text-text">General Information</h2>
              <span className="text-xs text-text/50">PUT /api/Resources/{id}</span>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="res-title" className="block text-xs font-semibold text-text">
                Title <span className="text-rose-500">*</span>
              </label>
              <Input
                id="res-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern React Design Patterns"
                required
              />
            </div>

            {/* Category & Access Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="res-cat" className="block text-xs font-semibold text-text">
                  Category
                </label>
                <select
                  id="res-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text">Access Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccessType(1)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                      accessType === 1
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border text-text/70 hover:bg-slate-50",
                    )}
                  >
                    <FiExternalLink className="w-3.5 h-3.5" />
                    <span>External Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessType(0)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                      accessType === 0
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border text-text/70 hover:bg-slate-50",
                    )}
                  >
                    <FiFile className="w-3.5 h-3.5" />
                    <span>File Upload</span>
                  </button>
                </div>
              </div>
            </div>

            {/* External URL (if Link) */}
            {accessType === 1 && (
              <div className="space-y-1.5">
                <label htmlFor="res-url" className="block text-xs font-semibold text-text">
                  External URL / Preview Link
                </label>
                <Input
                  id="res-url"
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://github.com/... or https://..."
                />
              </div>
            )}

            {/* Resource File Replacement (if File) */}
            {accessType === 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text">
                  Attachment File (.pdf, .zip, .epub, etc.)
                </label>
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="res-file"
                    className="hidden"
                    onChange={handleResourceFileChange}
                  />
                  <label htmlFor="res-file" className="cursor-pointer block space-y-1">
                    <FiUpload className="w-6 h-6 text-text/40 mx-auto" />
                    <p className="text-xs font-medium text-text">
                      {resourceFile ? resourceFile.name : "Click to replace attached file"}
                    </p>
                    <p className="text-[11px] text-text/40">
                      Leave empty to keep existing attachment
                    </p>
                  </label>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="res-desc" className="block text-xs font-semibold text-text">
                Description
              </label>
              <Textarea
                id="res-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what makes this resource valuable..."
              />
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <label htmlFor="res-tags" className="block text-xs font-semibold text-text">
                Tags
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="res-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag and press Enter"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddTag}
                  className="shrink-0"
                >
                  Add
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-600 transition-colors"
                        aria-label={`Remove tag ${t}`}
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                leftIcon={<FiSave className="w-4 h-4" />}
                className="rounded-xl px-6 font-bold shadow-xs"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column (1 Col): Logo & Sub-Parts Navigation */}
        <div className="space-y-6">
          {/* Logo / Cover Image Card */}
          <div className="bg-white border border-border rounded-2xl p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-text">Resource Logo / Icon</h3>
            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-border rounded-xl bg-slate-50/50 gap-3">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt={title}
                  className="w-20 h-20 rounded-xl object-cover border border-border shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-xs">
                  {title.slice(0, 2).toUpperCase() || "DS"}
                </div>
              )}

              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <FiUpload className="w-3.5 h-3.5" />
                <span>Upload New Logo</span>
              </label>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-white border border-border rounded-2xl p-5 space-y-3 shadow-2xs">
            <h3 className="text-sm font-bold text-text">Stats & Engagement</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
                <p className="text-xs text-text/50 font-medium">Upvotes</p>
                <p className="text-lg font-bold text-text mt-0.5">{resource?.upvoteCount ?? 0}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
                <p className="text-xs text-text/50 font-medium">Downvotes</p>
                <p className="text-lg font-bold text-text mt-0.5">{resource?.downvoteCount ?? 0}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
                <p className="text-xs text-text/50 font-medium">Downloads</p>
                <p className="text-lg font-bold text-text mt-0.5">
                  {resource?.downloadCount ?? 0}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
                <p className="text-xs text-text/50 font-medium">Bookmarks</p>
                <p className="text-lg font-bold text-text mt-0.5">{resource?.saveCount ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-Parts (Chapters / Modules) Section ──────────────────────── */}
      <section className="bg-white border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FiLayers className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-text">
                Sub-Parts & Chapters ({parts.length})
              </h2>
            </div>
            <p className="text-xs text-text/60 mt-0.5">
              Break this resource into sequential modules, lessons, or downloadable parts.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={<FiPlus className="w-4 h-4" />}
            onClick={handleOpenAddPartModal}
            className="rounded-xl font-semibold shadow-xs"
          >
            Add Sub-Part
          </Button>
        </div>

        {parts.length > 0 ? (
          <div className="space-y-3">
            {parts
              .slice()
              .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
              .map((part, index) => {
                const isFile = isPartAFile(part);
                return (
                  <div
                    key={part.partId || index}
                    className="p-4 rounded-xl border border-border hover:border-primary/40 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {part.sequenceOrder || index + 1}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-text truncate">{part.title}</h4>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider",
                              isFile
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800",
                            )}
                          >
                            {isFile ? "File" : "External Link"}
                          </span>
                        </div>

                        {part.description && (
                          <p className="text-xs text-text/70 line-clamp-2 leading-relaxed">
                            {part.description}
                          </p>
                        )}

                        {part.contentUrl && (
                          <a
                            href={part.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                          >
                            <span className="truncate max-w-xs">{part.contentUrl}</span>
                            <FiExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<FiEdit2 className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEditPartModal(part)}
                        className="text-xs h-8 px-2.5 rounded-lg"
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPartToDelete(part)}
                        className="text-xs h-8 px-2.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                        aria-label={`Delete ${part.title}`}
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <EmptyState
            size="sm"
            icon={<FiLayers className="w-8 h-8 text-text/30" />}
            title="No sub-parts yet"
            description="Add chapters, lessons, or auxiliary guides to make this resource richer."
            bordered
            action={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FiPlus className="w-4 h-4" />}
                onClick={handleOpenAddPartModal}
                className="rounded-xl"
              >
                Add First Sub-Part
              </Button>
            }
          />
        )}
      </section>

      {/* ── Sub-Part Add/Edit Modal ─────────────────────────────────────── */}
      <Modal
        open={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        title={editingPart ? "Edit Sub-Part" : "Add New Sub-Part"}
        size="md"
      >
        <form onSubmit={handleSavePart} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="part-title" className="block text-xs font-semibold text-text">
              Part Title <span className="text-rose-500">*</span>
            </label>
            <Input
              id="part-title"
              value={partTitle}
              onChange={(e) => setPartTitle(e.target.value)}
              placeholder="e.g. Chapter 1: Introduction"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="part-seq" className="block text-xs font-semibold text-text">
                Sequence Order
              </label>
              <Input
                id="part-seq"
                type="number"
                min={1}
                value={partSequence}
                onChange={(e) => setPartSequence(parseInt(e.target.value, 10) || 1)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text">Format</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPartAccessType(1)}
                  className={cn(
                    "py-2 px-2 rounded-lg border text-xs font-semibold transition-all",
                    partAccessType === 1
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-text/60",
                  )}
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => setPartAccessType(0)}
                  className={cn(
                    "py-2 px-2 rounded-lg border text-xs font-semibold transition-all",
                    partAccessType === 0
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-text/60",
                  )}
                >
                  File
                </button>
              </div>
            </div>
          </div>

          {partAccessType === 1 ? (
            <div className="space-y-1.5">
              <label htmlFor="part-url" className="block text-xs font-semibold text-text">
                Content URL
              </label>
              <Input
                id="part-url"
                type="url"
                value={partContentUrl}
                onChange={(e) => setPartContentUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text">Sub-Part Document</label>
              <input
                type="file"
                onChange={(e) => setPartFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-text file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="part-desc" className="block text-xs font-semibold text-text">
              Description (Optional)
            </label>
            <Textarea
              id="part-desc"
              rows={3}
              value={partDescription}
              onChange={(e) => setPartDescription(e.target.value)}
              placeholder="What does this chapter cover?"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsPartModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingPart}
              leftIcon={<FiCheck className="w-4 h-4" />}
            >
              {editingPart ? "Save Part" : "Add Part"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Sub-Part Delete Confirmation Modal ─────────────────────────── */}
      <Modal
        open={Boolean(partToDelete)}
        onClose={() => setPartToDelete(null)}
        title="Delete Sub-Part"
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 p-3 bg-rose-50 text-rose-800 rounded-xl">
            <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">Are you sure you want to delete this sub-part?</p>
              <p className="mt-0.5 text-rose-700">
                &ldquo;{partToDelete?.title}&rdquo; will be permanently deleted.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPartToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeletingPart}
              onClick={handleConfirmDeletePart}
              leftIcon={<FiTrash2 className="w-4 h-4" />}
            >
              Delete Sub-Part
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Entire Resource Delete Confirmation Modal ───────────────────── */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Resource Permanently"
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 text-rose-800 rounded-xl">
            <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold">This action cannot be undone.</p>
              <p className="mt-1 text-rose-700">
                This will permanently delete <strong>{title}</strong> and all associated
                sub-parts, votes, and bookmark references from DevSpace.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Keep Resource
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteResource}
              leftIcon={<FiTrash2 className="w-4 h-4" />}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
