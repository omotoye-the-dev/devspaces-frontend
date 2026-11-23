import type { JSX } from "react";
import { FiTrash2, FiAlertTriangle } from "react-icons/fi";
import { Button, Modal } from "@/shared/ui";

import type { UseResourceEditorResult } from "@/features/resources/hooks/useResourceEditor";

/** Confirm deleting the whole resource. */
export function DeleteResourceModal({ editor }: { editor: UseResourceEditorResult }): JSX.Element {
  const { isDeleting, showDeleteModal, setShowDeleteModal, title, handleDeleteResource } = editor;

  return (
    <>
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
                This will permanently delete <strong>{title}</strong> and all associated sub-parts,
                votes, and bookmark references from DevSpace.
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
    </>
  );
}
