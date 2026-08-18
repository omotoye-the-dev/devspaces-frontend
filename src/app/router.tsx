import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import SignInPage from "@/pages/auth/SignInPage";
import SignUpPage from "@/pages/auth/SignUpPage";
import OAuthCallbackPage from "@/pages/auth/OAuthCallbackPage";
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
      },
      {
        path: "auth/sign-up",
        element: <SignUpPage />,
      },
      {
        path: "auth/callback",
        element: <OAuthCallbackPage />,
      },
      {
        path: "auth/callback/:provider",
        element: <OAuthCallbackPage />,
      },
    ],
  },
  {
    path: "/playground",
    element: <Playground />,
  },
]);

