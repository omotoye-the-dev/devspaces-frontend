import { type JSX } from "react";
import { Button, Tag, useToast } from "@/shared/ui";

export function ToastSection(): JSX.Element {
  const { success, error, warning, info } = useToast();

  return (
    <>
      {/* ========================================================================= */}
      {/* 10. TOAST COMPONENT                                                      */}
      {/* ========================================================================= */}
      <section
        id="toast"
        className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text">10. Toast (Notifications)</h2>
            <p className="text-xs text-text/60">
              Success, Error, Warning, Info feedback toasts with action triggers and auto-dismiss.
            </p>
          </div>
          <Tag variant="primary">Toast.tsx</Tag>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="primary"
            onClick={() =>
              success("Article Published!", {
                description: "Your post is now trending on DevSpace.",
                action: { label: "View Post", onClick: () => info("Opening article view...") },
              })
            }
          >
            🎉 Trigger Success
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              info("Draft Saved", {
                description: "Changes automatically saved to local cloud.",
              })
            }
          >
            💾 Trigger Info
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              warning("Unpublished Article", {
                description: "Article moved to your draft queue.",
              })
            }
          >
            ⚠️ Trigger Warning
          </Button>

          <Button
            variant="danger"
            onClick={() =>
              error("Article Deleted", {
                description: "The post was permanently deleted.",
                action: { label: "Undo", onClick: () => success("Article restored!") },
              })
            }
          >
            🗑️ Trigger Error with Undo
          </Button>
        </div>
      </section>
    </>
  );
}
