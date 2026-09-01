import { useState, useEffect, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArticleEditor } from "@/features/articles/components/ArticleEditor";
import { getArticleById, createArticle, updateArticle } from "@/features/articles/api/articleApi";
import type { ArticleFormData } from "@/features/articles/schemas/articleSchema";
import { toast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export function ArticleEditorPage(): JSX.Element {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Partial<ArticleFormData> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(id));

  const isEditing = Boolean(id);

  useEffect(() => {
    if (!id) return;
    async function loadArticle() {
      try {
        setIsLoading(true);
        const article = await getArticleById(id as string);
        setInitialData(article);
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err) || "Failed to load article");
        navigate("/playground");
      } finally {
        setIsLoading(false);
      }
    }
    loadArticle();
  }, [id, navigate]);

  const handleSaveDraft = async (data: ArticleFormData) => {
    try {
      if (isEditing && id) {
        await updateArticle(id, { ...data, status: "draft" });
        toast.success("Draft updated successfully!");
      } else {
        const created = await createArticle({ ...data, status: "draft" });
        toast.success("Draft saved!");
        if (created.id) {
          navigate(`/articles/${created.id}/edit`, { replace: true });
        }
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err) || "Failed to save draft");
      throw err;
    }
  };

  const handlePublish = async (data: ArticleFormData) => {
    try {
      if (isEditing && id) {
        await updateArticle(id, data);
        toast.success(
          data.status === "scheduled"
            ? "Article scheduled successfully!"
            : "Article updated and published!",
        );
      } else {
        const created = await createArticle(data);
        toast.success(
          data.status === "scheduled"
            ? "Article scheduled successfully!"
            : "Article published successfully!",
        );
        if (created.id) {
          navigate(`/articles/${created.id}/edit`, { replace: true });
        }
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err) || "Failed to publish article");
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-text/60">Loading article editor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ArticleEditor
        key={id ?? "new"}
        initialData={initialData ?? undefined}
        isEditing={isEditing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
    </div>
  );
}

export default ArticleEditorPage;
