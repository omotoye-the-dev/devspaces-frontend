import type { JSX } from "react";
import { HiOutlineArrowTrendingUp, HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";

export interface TrendingDiscussion {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  replies: number;
  avatarColor: string;
}

const MOCK_TRENDING_DISCUSSIONS: TrendingDiscussion[] = [
  {
    id: "1",
    title: "What's your go-to code editor in 2024?",
    author: "Sarah Chen",
    timeAgo: "2h ago",
    replies: 128,
    avatarColor: "bg-violet-500",
  },
  {
    id: "2",
    title: "Best practices for API versioning",
    author: "Daniel Chafer",
    timeAgo: "5h ago",
    replies: 96,
    avatarColor: "bg-emerald-500",
  },
  {
    id: "3",
    title: "tRPC vs GraphQL vs REST: What should I use?",
    author: "Priya Shah",
    timeAgo: "7h ago",
    replies: 76,
    avatarColor: "bg-sky-500",
  },
  {
    id: "4",
    title: "How do you structure a monorepo?",
    author: "Ethan Miller",
    timeAgo: "9h ago",
    replies: 54,
    avatarColor: "bg-amber-500",
  },
  {
    id: "5",
    title: "Tips for writing better unit tests",
    author: "Olivia Rhye",
    timeAgo: "11h ago",
    replies: 42,
    avatarColor: "bg-rose-500",
  },
];

export function TrendingDiscussionsWidget({
  discussions,
}: {
  discussions?: TrendingDiscussion[];
}): JSX.Element {
  const items = discussions && discussions.length > 0 ? discussions : MOCK_TRENDING_DISCUSSIONS;

  return (
    <div className="bg-white border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text tracking-tight flex items-center gap-1.5">
          <HiOutlineArrowTrendingUp className="w-4 h-4 text-primary" />
          Trending Discussions
        </h3>
        <button
          type="button"
          className="text-[11px] text-primary font-medium hover:underline cursor-pointer"
        >
          View all
        </button>
      </div>

      <div className="space-y-0.5">
        {items.map((discussion) => (
          <div
            key={discussion.id}
            className="flex items-start gap-2.5 py-2 px-1 rounded-md hover:bg-background cursor-pointer transition-colors group/item"
          >
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
        ))}
      </div>
    </div>
  );
}

export default TrendingDiscussionsWidget;
