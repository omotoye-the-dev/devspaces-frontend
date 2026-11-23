import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router-dom";
import PageLoader from "@/shared/layout/PageLoader";
import AuthLayout from "@/features/auth/layouts/AuthLayout";
import PublicLayout from "@/shared/layout/PublicLayout";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import AuthGate from "@/features/auth/components/AuthGate";

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
        ...page(() => import("@/features/home/pages/HomePage")),
      },
      // Readable by guests; interactions are guarded inside each page
      { path: "articles", ...page(() => import("@/features/articles/pages/ArticlesPage")) },
      { path: "articles/:id", ...page(() => import("@/features/articles/pages/ArticleDetailsPage")) },
      { path: "resources", ...page(() => import("@/features/resources/pages/ResourcesPage")) },
      { path: "resources/:id", ...page(() => import("@/features/resources/pages/ResourceDetailsPage")) },
      { path: "profile/:id", ...page(() => import("@/features/profile/pages/ProfilePage")) },
      { path: "people", ...page(() => import("@/features/people/pages/PeoplePage")) },
      { path: "leaderboard", ...page(() => import("@/features/leaderboard/pages/LeaderboardPage")) },

      // Backend requires auth: guests see an in-place "log in" panel
      {
        element: (
          <AuthGate
            title="Log in to join the discussions"
            description="Browse questions, share answers and follow conversations with the DevSpace community."
          />
        ),
        children: [
          { path: "discussions", ...page(() => import("@/features/discussions/pages/DiscussionsPage")) },
          { path: "discussions/:id", ...page(() => import("@/features/discussions/pages/DiscussionsPage")) },
        ],
      },
      {
        element: (
          <AuthGate
            title="Log in to see your saved items"
            description="Articles, resources and discussions you save will show up here."
          />
        ),
        children: [{ path: "saved", ...page(() => import("@/features/saved/pages/SavedPage")) }],
      },
      {
        element: (
          <AuthGate
            title="Log in to see your history"
            description="Your recently viewed articles, resources and discussions will show up here."
          />
        ),
        children: [{ path: "history", ...page(() => import("@/features/history/pages/HistoryPage")) }],
      },
      {
        element: (
          <AuthGate
            title="Log in to view your profile"
            description="Sign in to see and edit your profile, articles and activity."
          />
        ),
        children: [{ path: "profile", ...page(() => import("@/features/profile/pages/ProfilePage")) }],
      },

      // Creating / editing content still redirects to sign-in
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "resources/:id/edit",
            ...page(() => import("@/features/resources/pages/ResourceEditorPage")),
          },
          { path: "articles/new", ...page(() => import("@/features/articles/pages/ArticleEditorPage")) },
          { path: "articles/:id/edit", ...page(() => import("@/features/articles/pages/ArticleEditorPage")) },
        ],
      },
      {
        path: "*",
        ...page(() => import("@/shared/pages/NotFoundPage")),
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
        ...page(() => import("@/features/auth/pages/SignInPage")),
      },
      {
        path: "sign-up",
        ...page(() => import("@/features/auth/pages/SignUpPage")),
      },
      {
        path: "forgot-password",
        ...page(() => import("@/features/auth/pages/ForgotPassword")),
      },
      {
        path: "verify-account",
        ...page(() => import("@/features/auth/pages/VerifyAccount")),
      },
      {
        path: "callback",
        ...page(() => import("@/features/auth/pages/OAuthCallbackPage")),
      },
      {
        path: "callback/:provider",
        ...page(() => import("@/features/auth/pages/OAuthCallbackPage")),
      },
    ],
  },
  {
    path: "/playground",
    hydrateFallbackElement: <PageLoader />,
    ...page(() => import("@/features/playground/pages/Playground")),
  },
  {
    path: "*",
    hydrateFallbackElement: <PageLoader />,
    ...page(() => import("@/shared/pages/NotFoundPage")),
  },
]);
