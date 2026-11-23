import type { JSX } from "react";
import { FiTrash2, FiAlertTriangle } from "react-icons/fi";
import { Button, Modal } from "@/shared/ui";

import type { UseResourceEditorResult } from "@/features/resources/hooks/useResourceEditor";

/** Confirm deleting one chapter. */
export function DeletePartModal({ editor }: { editor: UseResourceEditorResult }): JSX.Element {
  const { partToDelete, setPartToDelete, isDeletingPart, handleConfirmDeletePart } = editor;

  return (
    <>
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
    </>
  );
}
