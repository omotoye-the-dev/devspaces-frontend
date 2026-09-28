import type { JSX } from "react";
import { HiOutlineCog6Tooth } from "react-icons/hi2";

export const FEED_TABS = ["For You", "Following", "Latest", "Trending"] as const;

export function FeedTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}): JSX.Element {
  return (
    <div className="flex items-center justify-between border-b border-border">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {FEED_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`
                px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-150 border-b-2 cursor-pointer
                ${
                  isActive
                    ? "text-primary border-primary font-semibold"
                    : "text-text/50 border-transparent hover:text-text/80 hover:border-border"
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="flex items-center gap-1.5 px-3 py-2 text-xs text-text/50 hover:text-text/80 transition-colors cursor-pointer shrink-0"
      >
        <HiOutlineCog6Tooth className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Customize</span>
      </button>
    </div>
  );
}

export default FeedTabs;
