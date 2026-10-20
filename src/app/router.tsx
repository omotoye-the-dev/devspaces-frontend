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
import ResourcesPage from "@/pages/member/ResourcesPage";
import ResourceDetailsPage from "@/pages/member/ResourceDetailsPage";
import ResourceEditorPage from "@/pages/member/ResourceEditorPage";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import AuthGate from "@/components/shared/AuthGate";
import ProfilePage from "@/pages/member/ProfilePage";
import DiscussionsPage from "@/pages/member/DiscussionsPage";
import HistoryPage from "@/pages/member/HistoryPage";
import SavedPage from "@/pages/member/SavedPage";
import LeaderboardPage from "@/pages/member/LeaderboardPage";
import PeoplePage from "@/pages/member/PeoplePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // Readable by guests; interactions are guarded inside each page
      { path: "articles", element: <ArticlesPage /> },
      { path: "articles/:id", element: <ArticleDetailsPage /> },
      { path: "resources", element: <ResourcesPage /> },
      { path: "resources/:id", element: <ResourceDetailsPage /> },
      { path: "profile/:id", element: <ProfilePage /> },
      { path: "people", element: <PeoplePage /> },
      { path: "leaderboard", element: <LeaderboardPage /> },

      // Backend requires auth: guests see an in-place "log in" panel
      {
        element: (
          <AuthGate
            title="Log in to join the discussions"
            description="Browse questions, share answers and follow conversations with the DevSpace community."
          />
        ),
        children: [
          { path: "discussions", element: <DiscussionsPage /> },
          { path: "discussions/:id", element: <DiscussionsPage /> },
        ],
      },
      {
        element: (
          <AuthGate
            title="Log in to see your saved items"
            description="Articles, resources and discussions you save will show up here."
          />
        ),
        children: [{ path: "saved", element: <SavedPage /> }],
      },
      {
        element: (
          <AuthGate
            title="Log in to see your history"
            description="Your recently viewed articles, resources and discussions will show up here."
          />
        ),
        children: [{ path: "history", element: <HistoryPage /> }],
      },
      {
        element: (
          <AuthGate
            title="Log in to view your profile"
            description="Sign in to see and edit your profile, articles and activity."
          />
        ),
        children: [{ path: "profile", element: <ProfilePage /> }],
      },

      // Creating / editing content still redirects to sign-in
      {
        element: <ProtectedRoute />,
        children: [
          { path: "resources/:id/edit", element: <ResourceEditorPage /> },
          { path: "articles/new", element: <ArticleEditorPage /> },
          { path: "articles/:id/edit", element: <ArticleEditorPage /> },
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

