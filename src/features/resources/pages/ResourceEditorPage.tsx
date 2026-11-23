import type { JSX } from "react";
import { Skeleton } from "@/shared/ui";

import { useResourceEditor } from "@/features/resources/hooks/useResourceEditor";
import { EditorTopBar } from "@/features/resources/components/resource-editor/EditorTopBar";
import { ResourceDetailsForm } from "@/features/resources/components/resource-editor/ResourceDetailsForm";
import { ResourceEditorSidebar } from "@/features/resources/components/resource-editor/ResourceEditorSidebar";
import { ResourcePartsSection } from "@/features/resources/components/resource-editor/ResourcePartsSection";
import { PartFormModal } from "@/features/resources/components/resource-editor/PartFormModal";
import { DeletePartModal } from "@/features/resources/components/resource-editor/DeletePartModal";
import { DeleteResourceModal } from "@/features/resources/components/resource-editor/DeleteResourceModal";

export default function ResourceEditorPage(): JSX.Element {
  const editor = useResourceEditor();
  const { isLoading } = editor;

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
      <EditorTopBar editor={editor} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Resource Details Form */}
        <ResourceDetailsForm editor={editor} />

        {/* Right Column (1 Col): Logo & Sub-Parts Navigation */}
        <ResourceEditorSidebar editor={editor} />
      </div>

      {/* ── Sub-Parts (Chapters / Modules) Section ──────────────────────── */}
      <ResourcePartsSection editor={editor} />

      {/* ── Sub-Part Add/Edit Modal ─────────────────────────────────────── */}
      <PartFormModal editor={editor} />

      {/* ── Sub-Part Delete Confirmation Modal ─────────────────────────── */}
      <DeletePartModal editor={editor} />

      {/* ── Entire Resource Delete Confirmation Modal ───────────────────── */}
      <DeleteResourceModal editor={editor} />
    </div>
  );
}
