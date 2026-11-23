import type { JSX } from "react";
import { FiArrowLeft, FiFolder } from "react-icons/fi";
import { Button, Skeleton } from "@/shared/ui";

import { useResourceDetails } from "@/features/resources/hooks/useResourceDetails";
import { ResourceBreadcrumbs } from "@/features/resources/components/resource-details/ResourceBreadcrumbs";
import { ResourceHero } from "@/features/resources/components/resource-details/ResourceHero";
import { ResourceActionBar } from "@/features/resources/components/resource-details/ResourceActionBar";
import { ResourceMainContent } from "@/features/resources/components/resource-details/ResourceMainContent";
import { ResourceDetailsSidebar } from "@/features/resources/components/resource-details/ResourceDetailsSidebar";

export function ResourceDetailsPage(): JSX.Element {
  const details = useResourceDetails();
  const { resource, isLoading, error, navigate, currentUser } = details;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <Skeleton className="h-5 w-40 rounded" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <FiFolder className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-text">Resource Not Found</h1>
        <p className="text-xs sm:text-sm text-text/60">
          {error || "The resource you are looking for does not exist or has been removed."}
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/resources")}
          leftIcon={<FiArrowLeft className="w-4 h-4" />}
          className="mt-2"
        >
          Back to Resources
        </Button>
      </div>
    );
  }

  const isOwner = Boolean(currentUser?.id) && currentUser?.id === resource.uploader?.userId;

  return (
    <div className="min-h-full bg-background overflow-y-auto">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8">
        {/* Navigation Breadcrumbs */}
        <ResourceBreadcrumbs details={details} />

        {/* Header Hero Section */}
        <ResourceHero resource={resource} isOwner={isOwner} />

        {/* Action Bar (Upvote, Downvote, Save, Direct Resource Link, Edit) */}
        <ResourceActionBar details={details} resource={resource} />

        {/* Two-Column Grid: Content & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content (Left Col, Span 2) */}
          <ResourceMainContent details={details} resource={resource} />

          {/* Right Sidebar: Author & Stats */}
          <ResourceDetailsSidebar details={details} resource={resource} />
        </div>
      </div>
    </div>
  );
}

export default ResourceDetailsPage;
