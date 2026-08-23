import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import SignInPage from "@/pages/auth/SignInPage";
import SignUpPage from "@/pages/auth/SignUpPage";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyAccount from "@/pages/auth/VerifyAccount";
import OAuthCallbackPage from "@/pages/auth/OAuthCallbackPage";
import Playground from "@/pages/Playground";
import NavBar from "@/components/common/NavBar";

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
  {
    path: "/navbar",
    element: <NavBar />,
  }
]);

