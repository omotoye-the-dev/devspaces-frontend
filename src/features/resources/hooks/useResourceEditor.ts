import { useState, useEffect, type ChangeEvent, type KeyboardEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getResourceById,
  updateResource,
  deleteResource,
  addResourcePart,
  updateResourcePart,
  deleteResourcePart,
} from "@/features/resources/api/resources.api";
import type { ResourceDetail, ResourcePart } from "@/features/resources/types/resources.types";
import { toast } from "@/shared/hooks/useToast";
import { getApiErrorMessage } from "@/shared/lib/utils/apiError";
import { invalidateResources } from "@/features/resources/api/resourceQueries";

/** State and actions for editing a resource you own: details, logo/file, tags, chapters, and deletion. */
export function useResourceEditor() {
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
      void invalidateResources();
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
      void invalidateResources();
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
        void invalidateResources();
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
        void invalidateResources();
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
      void invalidateResources();
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

  return {
    resource,
    setResource,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    isDeleting,
    setIsDeleting,
    showDeleteModal,
    setShowDeleteModal,
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    accessType,
    setAccessType,
    externalUrl,
    setExternalUrl,
    tags,
    setTags,
    tagInput,
    setTagInput,
    logoFile,
    setLogoFile,
    logoPreview,
    setLogoPreview,
    resourceFile,
    setResourceFile,
    parts,
    setParts,
    isPartModalOpen,
    setIsPartModalOpen,
    editingPart,
    setEditingPart,
    partTitle,
    setPartTitle,
    partDescription,
    setPartDescription,
    partAccessType,
    setPartAccessType,
    partContentUrl,
    setPartContentUrl,
    partFile,
    setPartFile,
    partSequence,
    setPartSequence,
    isSavingPart,
    setIsSavingPart,
    partToDelete,
    setPartToDelete,
    isDeletingPart,
    setIsDeletingPart,
    id,
    navigate,
    handleLogoChange,
    handleResourceFileChange,
    handleAddTag,
    handleTagKeyDown,
    handleRemoveTag,
    handleSaveDetails,
    handleDeleteResource,
    handleOpenAddPartModal,
    handleOpenEditPartModal,
    handleSavePart,
    handleConfirmDeletePart,
  };
}

export type UseResourceEditorResult = ReturnType<typeof useResourceEditor>;
