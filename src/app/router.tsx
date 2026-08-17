import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import SignInPage from "@/pages/auth/SignInPage";
import Playground from "@/pages/Playground";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <SignInPage />,
      },
      {
        path: "auth/sign-in",
        element: <SignInPage />,
      }
    ],
  },
  {
    path: "/playground",
    element: <Playground />,
  },
]);

