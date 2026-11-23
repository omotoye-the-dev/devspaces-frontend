import type { JSX, ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/lib/queryClient";
import { ToastProvider, ConfirmDialogProvider } from "@/shared/ui";

export function AppProviders({ children }: { children: ReactNode }): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider position="top-right">
        <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
