import type { JSX } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiTrash2, FiEye } from "react-icons/fi";
import { Button } from "@/shared/ui";

import type { UseResourceEditorResult } from "@/features/resources/hooks/useResourceEditor";

/** Back link, title and view/delete actions. */
export function EditorTopBar({ editor }: { editor: UseResourceEditorResult }): JSX.Element {
  const { setShowDeleteModal, id, navigate } = editor;

  return (
    <>
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
    </>
  );
}
