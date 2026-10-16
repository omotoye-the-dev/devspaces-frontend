import type { JSX } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastProvider, ConfirmDialogProvider } from "@/components/common";
import { router } from "./router";

export default function App(): JSX.Element {
  return (
    <ToastProvider position="top-right">
      <ConfirmDialogProvider>
        <RouterProvider router={router} />
      </ConfirmDialogProvider>
    </ToastProvider>
  );
}
