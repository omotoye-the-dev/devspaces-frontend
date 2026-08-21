import type { JSX } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "@/components/common";
import { router } from "./router";

export default function App(): JSX.Element {
  return (
    <ToastProvider position="top-right">
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
