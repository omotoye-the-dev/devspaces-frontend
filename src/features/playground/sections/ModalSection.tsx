import { useState, type JSX } from "react";
import { Button, Input, Textarea, Select, Tag, Modal, type ModalSize, useToast } from "@/shared/ui";

export function ModalSection(): JSX.Element {
  const { success, error, warning } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"delete" | "publish" | "report" | "custom">("delete");
  const [modalSize, setModalSize] = useState<ModalSize>("md");
  return (
    <>
      {/* ========================================================================= */}
      {/* 8. MODAL COMPONENT                                                       */}
      {/* ========================================================================= */}
      <section
        id="modal"
        className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text">8. Modal (Dialogs)</h2>
            <p className="text-xs text-text/60">
              Focus trap, Escape key closing, React Portal, body scroll lock, and sizes.
            </p>
          </div>
          <Tag variant="primary">Modal.tsx</Tag>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-text/70">Size Selector:</span>
            <div className="flex items-center gap-1.5">
              {(["sm", "md", "lg", "xl"] as ModalSize[]).map((sz) => (
                <Button
                  key={sz}
                  size="sm"
                  variant={modalSize === sz ? "primary" : "secondary"}
                  onClick={() => setModalSize(sz)}
                >
                  {sz.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="danger"
              onClick={() => {
                setModalType("delete");
                setModalOpen(true);
              }}
            >
              Open Delete Modal
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setModalType("publish");
                setModalOpen(true);
              }}
            >
              Open Publish Modal
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setModalType("report");
                setModalOpen(true);
              }}
            >
              Open Report Modal
            </Button>
          </div>
        </div>

        {/* Active Modal */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          size={modalSize}
          title={
            modalType === "delete"
              ? "Delete Article"
              : modalType === "publish"
                ? "Publish Article to Feed"
                : "Report Inappropriate Content"
          }
          description={
            modalType === "delete"
              ? "Are you sure you want to delete this article? This action cannot be undone."
              : modalType === "publish"
                ? "Configure your article distribution before publishing live."
                : "Help keep DevSpace safe and constructive for all developers."
          }
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={modalType === "delete" ? "danger" : "primary"}
                onClick={() => {
                  setModalOpen(false);
                  if (modalType === "delete")
                    error("Article Deleted", { description: "Permanently removed." });
                  else if (modalType === "publish")
                    success("Article Published!", { description: "Live on feeds." });
                  else warning("Report submitted for review");
                }}
              >
                {modalType === "delete"
                  ? "Delete Permanently"
                  : modalType === "publish"
                    ? "Publish Now"
                    : "Submit Report"}
              </Button>
            </>
          }
        >
          {modalType === "delete" ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
              ⚠️ All associated comments, bookmarks, and read metrics will also be deleted.
            </div>
          ) : modalType === "publish" ? (
            <div className="space-y-3">
              <Input label="Canonical URL (Optional)" placeholder="https://..." />
              <Select
                label="Community Topic"
                options={[
                  { label: "#react (React & Next.js)", value: "react" },
                  { label: "#typescript (TypeScript)", value: "ts" },
                  { label: "#devops (DevOps & Cloud)", value: "devops" },
                ]}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Select
                label="Reason"
                options={[
                  { label: "Spam or promotional", value: "spam" },
                  { label: "Harassment or offensive", value: "harassment" },
                  { label: "Misleading info", value: "misleading" },
                ]}
              />
              <Textarea label="Details" placeholder="Context for moderators..." rows={3} />
            </div>
          )}
        </Modal>
      </section>
    </>
  );
}
