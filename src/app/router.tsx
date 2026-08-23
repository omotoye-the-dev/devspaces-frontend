import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import SignInPage from "@/pages/auth/SignInPage";
import SignUpPage from "@/pages/auth/SignUpPage";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyAccount from "@/pages/auth/VerifyAccount";
import OAuthCallbackPage from "@/pages/auth/OAuthCallbackPage";
import Playground from "@/pages/Playground";
import PublicLayout from "@/layouts/PublicLayout";
import NotFoundPage from "@/pages/NotFoundPage";
import HomePage from "@/pages/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "auth",
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
        path: "auth/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "auth/verify-account",
        element: <VerifyAccount />,
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
