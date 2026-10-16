import { useCallback, useEffect, useState, type ReactNode, type JSX } from "react";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { cn } from "@/lib/utils/cn";
import {
  ConfirmDialogContext,
  setGlobalConfirmDispatcher,
  type ConfirmOptions,
  type ConfirmRequest,
} from "@/hooks/useConfirmDialog";

export type { ConfirmOptions, ConfirmVariant } from "@/hooks/useConfirmDialog";

export interface ConfirmDialogProviderProps {
  children: ReactNode;
}

export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps): JSX.Element {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);

  const requestConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const id = `confirm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setRequest({ id, resolve, ...options });
    });
  }, []);

  const resolveRequest = useCallback(
    (confirmed: boolean): void => {
      setRequest((current) => {
        current?.resolve(confirmed);
        return null;
      });
    },
    [],
  );

  useEffect(() => {
    const cleanup = setGlobalConfirmDispatcher(requestConfirm);
    return cleanup;
  }, [requestConfirm]);

  const isDanger = request?.variant === "danger";

  return (
    <ConfirmDialogContext.Provider value={{ request, requestConfirm, resolveRequest }}>
      {children}

      <Modal
        open={Boolean(request)}
        onClose={() => resolveRequest(false)}
        size="sm"
        showCloseButton={false}
      >
        {request && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                  isDanger ? "bg-rose-100 text-rose-600" : "bg-primary/10 text-primary",
                )}
              >
                <HiOutlineExclamationTriangle className="w-5 h-5" />
              </div>
              <div className="pt-1 space-y-1">
                {request.title && (
                  <h3 className="text-sm font-bold text-text leading-snug">{request.title}</h3>
                )}
                {request.description && (
                  <p className="text-xs text-text/60 leading-relaxed">{request.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button variant="ghost" size="sm" onClick={() => resolveRequest(false)}>
                {request.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                variant={isDanger ? "danger" : "primary"}
                size="sm"
                onClick={() => resolveRequest(true)}
              >
                {request.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmDialogContext.Provider>
  );
}
