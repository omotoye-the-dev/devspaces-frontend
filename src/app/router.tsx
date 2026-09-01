import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import SignInPage from "@/pages/auth/SignInPage";
import SignUpPage from "@/pages/auth/SignUpPage";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyAccount from "@/pages/auth/VerifyAccount";
import OAuthCallbackPage from "@/pages/auth/OAuthCallbackPage";
import Playground from "@/pages/Playground";
import PublicLayout from "@/layouts/PublicLayout";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import ArticleEditorPage from "@/pages/member/ArticleEditorPage";
import ArticleDetailsPage from "@/pages/member/ArticleDetailsPage";
import ArticlesPage from "@/pages/member/ArticlesPage";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

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
        element: <ProtectedRoute />,
        children: [
          {
            path: "articles",
            element: <ArticlesPage />,
          },
          {
            path: "articles/new",
            element: <ArticleEditorPage />,
          },
          {
            path: "articles/:id/edit",
            element: <ArticleEditorPage />,
          },
          {
            path: "articles/:id",
            element: <ArticleDetailsPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },

  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "sign-in",
        element: <SignInPage />,
      },
      {
        path: "sign-up",
        element: <SignUpPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "verify-account",
        element: <VerifyAccount />,
      },
      {
        path: "callback",
        element: <OAuthCallbackPage />,
      },
      {
        path: "callback/:provider",
        element: <OAuthCallbackPage />,
      },
    ],
  },
  {
    path: "/playground",
    element: <Playground />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

