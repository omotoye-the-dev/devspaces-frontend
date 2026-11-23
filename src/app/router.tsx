import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router-dom";
import PageLoader from "@/components/shared/PageLoader";
import AuthLayout from "@/layouts/AuthLayout";
import PublicLayout from "@/layouts/PublicLayout";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import AuthGate from "@/components/shared/AuthGate";

// Pages are code-split: each one downloads only when its route is first visited.
// React Router keeps the current page on screen while the next one loads.
const page = (load: () => Promise<{ default: ComponentType }>) => ({
  lazy: async () => ({ Component: (await load()).default }),
});

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        index: true,
        ...page(() => import("@/pages/HomePage")),
      },
      // Readable by guests; interactions are guarded inside each page
      { path: "articles", ...page(() => import("@/pages/member/ArticlesPage")) },
      { path: "articles/:id", ...page(() => import("@/pages/member/ArticleDetailsPage")) },
      { path: "resources", ...page(() => import("@/pages/member/ResourcesPage")) },
      { path: "resources/:id", ...page(() => import("@/pages/member/ResourceDetailsPage")) },
      { path: "profile/:id", ...page(() => import("@/pages/member/ProfilePage")) },
      { path: "people", ...page(() => import("@/pages/member/PeoplePage")) },
      { path: "leaderboard", ...page(() => import("@/pages/member/LeaderboardPage")) },

      // Backend requires auth: guests see an in-place "log in" panel
      {
        element: (
          <AuthGate
            title="Log in to join the discussions"
            description="Browse questions, share answers and follow conversations with the DevSpace community."
          />
        ),
        children: [
          { path: "discussions", ...page(() => import("@/pages/member/DiscussionsPage")) },
          { path: "discussions/:id", ...page(() => import("@/pages/member/DiscussionsPage")) },
        ],
      },
      {
        element: (
          <AuthGate
            title="Log in to see your saved items"
            description="Articles, resources and discussions you save will show up here."
          />
        ),
        children: [{ path: "saved", ...page(() => import("@/pages/member/SavedPage")) }],
      },
      {
        element: (
          <AuthGate
            title="Log in to see your history"
            description="Your recently viewed articles, resources and discussions will show up here."
          />
        ),
        children: [{ path: "history", ...page(() => import("@/pages/member/HistoryPage")) }],
      },
      {
        element: (
          <AuthGate
            title="Log in to view your profile"
            description="Sign in to see and edit your profile, articles and activity."
          />
        ),
        children: [{ path: "profile", ...page(() => import("@/pages/member/ProfilePage")) }],
      },

      // Creating / editing content still redirects to sign-in
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "resources/:id/edit",
            ...page(() => import("@/pages/member/ResourceEditorPage")),
          },
          { path: "articles/new", ...page(() => import("@/pages/member/ArticleEditorPage")) },
          { path: "articles/:id/edit", ...page(() => import("@/pages/member/ArticleEditorPage")) },
        ],
      },
      {
        path: "*",
        ...page(() => import("@/pages/NotFoundPage")),
      },
    ],
  },

  {
    path: "/auth",
    element: <AuthLayout />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        path: "sign-in",
        ...page(() => import("@/pages/auth/SignInPage")),
      },
      {
        path: "sign-up",
        ...page(() => import("@/pages/auth/SignUpPage")),
      },
      {
        path: "forgot-password",
        ...page(() => import("@/pages/auth/ForgotPassword")),
      },
      {
        path: "verify-account",
        ...page(() => import("@/pages/auth/VerifyAccount")),
      },
      {
        path: "callback",
        ...page(() => import("@/pages/auth/OAuthCallbackPage")),
      },
      {
        path: "callback/:provider",
        ...page(() => import("@/pages/auth/OAuthCallbackPage")),
      },
    ],
  },
  {
    path: "/playground",
    hydrateFallbackElement: <PageLoader />,
    ...page(() => import("@/pages/Playground")),
  },
  {
    path: "*",
    hydrateFallbackElement: <PageLoader />,
    ...page(() => import("@/pages/NotFoundPage")),
  },
]);
