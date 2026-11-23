import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Tag } from "@/shared/ui";
import type { TrendingDiscussionItem } from "@/features/home/types";
import { HiOutlineHeart, HiOutlineChatBubbleOvalLeft, HiHeart } from "react-icons/hi2";
import { LuMessageSquare } from "react-icons/lu";

export function TrendingDiscussionCard({
  item,
  onLike,
}: {
  item: TrendingDiscussionItem;
  onLike: () => void;
}): JSX.Element {
  const navigate = useNavigate();
  return (
    <article
      className="bg-white border border-border rounded-lg p-4 sm:p-5 hover:border-violet-300 hover:shadow-sm transition-all duration-200 group cursor-pointer"
      onClick={() => navigate(`/discussions/${item.id}`)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Avatar
          src={item.authorAvatar}
          name={item.authorName}
          size="sm"
          href={null}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <span className="text-[12px] font-semibold text-text truncate block">
            {item.authorName}
          </span>
          <span className="text-[11px] text-text/40">{item.date}</span>
        </div>
        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0 flex items-center gap-1">
          <LuMessageSquare className="w-2.5 h-2.5" /> Discussion
        </span>
      </div>
      <h3 className="text-[15px] font-bold text-text leading-snug tracking-tight mb-1 group-hover:text-violet-600 transition-colors line-clamp-2">
        {item.title}
      </h3>
      <p className="text-[12px] text-text/55 leading-relaxed line-clamp-2 mb-2.5">{item.content}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {item.tags.slice(0, 3).map((tag) => (
          <Tag key={tag} variant="outline" size="sm" clickable>
            {tag}
          </Tag>
        ))}
      </div>
      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onLike}
          className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${item.liked ? "text-rose-500" : "text-text/40 hover:text-rose-500"}`}
        >
          {item.liked ? (
            <HiHeart className="w-3.5 h-3.5" />
          ) : (
            <HiOutlineHeart className="w-3.5 h-3.5" />
          )}
          <span className="font-medium">{item.upvotes}</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-text/40 hover:text-violet-600 transition-colors cursor-pointer"
        >
          <HiOutlineChatBubbleOvalLeft className="w-3.5 h-3.5" />
          <span className="font-medium">{item.comments}</span>
        </button>
      </div>
    </article>
  );
}
