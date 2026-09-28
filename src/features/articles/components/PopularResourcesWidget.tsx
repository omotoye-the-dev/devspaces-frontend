import type { JSX } from "react";
import { FiStar, FiExternalLink } from "react-icons/fi";
import { SiTypescript, SiDocker, SiReact, SiNodedotjs } from "react-icons/si";

export interface PopularResource {
  id: string;
  name: string;
  url: string;
  stars: string;
  icon: JSX.Element;
  iconBg: string;
}

const POPULAR_RESOURCES: PopularResource[] = [
  {
    id: "1",
    name: "TypeScript Handbook",
    url: "Official Docs",
    stars: "12.4k",
    icon: <SiTypescript className="w-4 h-4 text-white" />,
    iconBg: "bg-[#3178C6]",
  },
  {
    id: "2",
    name: "Docker Cheat Sheet",
    url: "devspace-co/cheatsheets",
    stars: "8.7k",
    icon: <SiDocker className="w-4 h-4 text-white" />,
    iconBg: "bg-[#2496ED]",
  },
  {
    id: "3",
    name: "React Patterns",
    url: "reactpatterns.com",
    stars: "7.1k",
    icon: <SiReact className="w-4 h-4 text-white" />,
    iconBg: "bg-[#61DAFB]/90",
  },
  {
    id: "4",
    name: "Node.js Best Practices",
    url: "github.com/goldbergyoni",
    stars: "6.3k",
    icon: <SiNodedotjs className="w-4 h-4 text-white" />,
    iconBg: "bg-[#5FA04E]",
  },
  {
    id: "5",
    name: "System Design Primer",
    url: "github.com/donnemartin",
    stars: "5.2k",
    icon: (
      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
    iconBg: "bg-gray-700",
  },
];

export function PopularResourcesWidget({
  resources = POPULAR_RESOURCES,
}: {
  resources?: PopularResource[];
}): JSX.Element {
  return (
    <div className="bg-white border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text tracking-tight">
          Popular Resources
        </h3>
        <button
          type="button"
          className="text-[11px] text-primary font-medium hover:underline cursor-pointer"
        >
          View all
        </button>
      </div>

      <div className="space-y-0.5">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center gap-2.5 py-2 px-1 rounded-md hover:bg-background cursor-pointer transition-colors group/item"
          >
            <div
              className={`w-8 h-8 rounded-lg ${resource.iconBg} flex items-center justify-center shrink-0`}
            >
              {resource.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-semibold text-text truncate group-hover/item:text-primary transition-colors">
                {resource.name}
              </p>
              <div className="flex items-center gap-1 text-[10.5px] text-text/40">
                <span className="truncate">{resource.url}</span>
                <FiExternalLink className="w-2.5 h-2.5 shrink-0" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-text/40 shrink-0">
              <FiStar className="w-3 h-3" />
              <span className="font-medium">{resource.stars}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PopularResourcesWidget;
