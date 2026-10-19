import { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowUp } from "react-icons/fi";
import { Skeleton } from "@/components/common";
import { getResources } from "@/features/resources/api/resources.api";
import type { ResourceListItem } from "@/types/resources.types";

/** Category-to-color map for resource icons */
const CATEGORY_COLORS: Record<string, string> = {
  frontend: "#61DAFB",
  backend: "#5FA04E",
  devops: "#2496ED",
  design: "#FF6B6B",
  mobile: "#A259FF",
  "data-science": "#F7931E",
  "machine-learning": "#FF4081",
  security: "#EF5350",
  database: "#336791",
  cloud: "#FF9900",
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category?.toLowerCase()] || "#6366f1";
}

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

function getSafeResourceCategory(category: string | null | undefined): string {
  return category ? String(category).trim() || "general" : "general";
}

export function PopularResourcesWidget(): JSX.Element {
  const navigate = useNavigate();
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function fetchPopularResources(): Promise<void> {
      setIsLoading(true);
      try {
        const response = await getResources({
          page: 1,
          pageSize: 5,
          sortBy: "upvotes",
        });

        const nextResources = Array.isArray(response?.data) ? response.data : [];
        const sortedResources = [...nextResources].sort((a, b) => {
          const engagementA =
            Number(a.upvoteCount ?? 0) +
            Number(a.saveCount ?? 0) +
            Number(a.downloadCount ?? 0);
          const engagementB =
            Number(b.upvoteCount ?? 0) +
            Number(b.saveCount ?? 0) +
            Number(b.downloadCount ?? 0);

          return engagementB - engagementA || Number(b.upvoteCount ?? 0) - Number(a.upvoteCount ?? 0);
        });

        if (active) {
          setResources(sortedResources);
        }
      } catch {
        if (active) {
          setResources([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void fetchPopularResources();
    return () => {
      active = false;
    };
  }, []);

  const handleResourceClick = (id: string): void => {
    navigate(`/resources/${id}`);
  };

  return (
    <div className="bg-white border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text tracking-tight">
          Popular Resources
        </h3>
        <button
          type="button"
          className="text-[11px] text-primary font-medium hover:underline cursor-pointer"
          onClick={() => navigate("/resources")}
        >
          View all
        </button>
      </div>

      <div className="space-y-0.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 py-2 px-1"
            >
              <Skeleton variant="rounded" width={32} height={32} />
              <div className="flex-1 space-y-1">
                <Skeleton variant="text" width="75%" height={13} />
                <Skeleton variant="text" width="50%" height={10} />
              </div>
              <Skeleton variant="text" width={30} height={12} />
            </div>
          ))
        ) : resources.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-xs text-text/40">No resources found</p>
          </div>
        ) : (
          resources.map((resource) => {
            const title = resource.title || "Untitled Resource";
            const category = getSafeResourceCategory(resource.category);
            const color = getCategoryColor(category);
            const initials = title
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase() || "R";
            const uploaderLabel = resource.uploader?.username
              ? `@${resource.uploader.username}`
              : resource.uploader?.name || "DevSpace";
            const upvoteCount = Number(resource.upvoteCount ?? 0);

            return (
              <div
                key={resource.id}
                onClick={() => handleResourceClick(resource.id)}
                className="flex items-center gap-2.5 py-2 px-1 rounded-md hover:bg-background cursor-pointer transition-colors group/item"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ backgroundColor: color }}
                >
                  {resource.logoUrl ? (
                    <img
                      src={resource.logoUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                      onError={(event) => {
                        const target = event.currentTarget;
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-white leading-none">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-semibold text-text truncate group-hover/item:text-primary transition-colors">
                    {title}
                  </p>
                  <div className="flex items-center gap-1 text-[10.5px] text-text/40">
                    <span className="truncate">{uploaderLabel}</span>
                    <span>·</span>
                    <span className="capitalize shrink-0">{category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-text/40 shrink-0">
                  <FiArrowUp className="w-3 h-3" />
                  <span className="font-medium">{formatCount(upvoteCount)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PopularResourcesWidget;
