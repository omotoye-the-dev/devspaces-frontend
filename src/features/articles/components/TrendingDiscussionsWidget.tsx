import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowTrendingUp, HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";

export interface TrendingDiscussion {
  id: string;
  title: string;
  author: string;
  username?: string;
  avatarUrl?: string | null;
  timeAgo: string;
  replies: number;
  avatarColor: string;
}

export function TrendingDiscussionsWidget({
  discussions,
}: {
  discussions?: TrendingDiscussion[];
}): JSX.Element {
  const navigate = useNavigate();
  const items = discussions ?? [];

  return (
    <div className="bg-white border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text tracking-tight flex items-center gap-1.5">
          <HiOutlineArrowTrendingUp className="w-4 h-4 text-primary" />
          Trending Discussions
        </h3>
        <button
          type="button"
          onClick={() => navigate("/discussions")}
          className="text-[11px] text-primary font-medium hover:underline cursor-pointer"
        >
          View all
        </button>
      </div>

      <div className="space-y-0.5">
        {items.length === 0 ? (
          <p className="text-[12px] text-text/50 py-2">No trending discussions yet.</p>
        ) : (
          items.map((discussion) => (
            <div
              key={discussion.id}
              onClick={() => navigate(`/discussions/${discussion.id}`)}
              className="flex items-start gap-2.5 py-2 px-1 rounded-md hover:bg-background cursor-pointer transition-colors group/item"
            >
              {discussion.avatarUrl ? (
                <img
                  src={discussion.avatarUrl}
                  alt={discussion.author}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-border"
                  onError={(event) => {
                    const target = event.currentTarget;
                    target.style.display = "none";
                  }}
                />
              ) : (
                <div
                  className={`w-7 h-7 rounded-full ${discussion.avatarColor} flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5`}
                >
                  {discussion.author
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("") || "A"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-text leading-snug line-clamp-2 group-hover/item:text-primary transition-colors">
                  {discussion.title}
                </p>
                <p className="text-[10.5px] text-text/40 mt-0.5">
                  {discussion.author} · {discussion.timeAgo}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-text/40 shrink-0 mt-1">
                <HiOutlineChatBubbleOvalLeft className="w-3 h-3" />
                <span className="font-medium">{discussion.replies}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TrendingDiscussionsWidget;
