import { createContext, useContext, useCallback, type ReactNode } from "react";

export type ConfirmVariant = "default" | "danger";

export interface ConfirmOptions {
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

export interface ConfirmRequest extends ConfirmOptions {
  id: string;
  resolve: (confirmed: boolean) => void;
}

export interface ConfirmDialogContextValue {
  request: ConfirmRequest | null;
  requestConfirm: (options: ConfirmOptions) => Promise<boolean>;
  resolveRequest: (confirmed: boolean) => void;
}

export const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

let globalRequestConfirm: ((options: ConfirmOptions) => Promise<boolean>) | null = null;

export function setGlobalConfirmDispatcher(
  dispatch: (options: ConfirmOptions) => Promise<boolean>,
): () => void {
  globalRequestConfirm = dispatch;
  return () => {
    globalRequestConfirm = null;
  };
}

export function useConfirmDialog(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
} {
  const context = useContext(ConfirmDialogContext);

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      if (context) {
        return context.requestConfirm(options);
      }
      if (globalRequestConfirm) {
        return globalRequestConfirm(options);
      }
      return Promise.resolve(false);
    },
    [context],
  );

  return { confirm };
}

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  if (globalRequestConfirm) {
    return globalRequestConfirm(options);
  }
  return Promise.resolve(false);
}
