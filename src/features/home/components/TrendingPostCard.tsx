import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Tag } from "@/shared/ui";
import type { TrendingPostItem } from "@/features/home/types";
import {
  HiOutlineHeart,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineBookmark,
  HiHeart,
} from "react-icons/hi2";
import { LuFileText } from "react-icons/lu";

export function TrendingPostCard({
  item,
  onLike,
  onSave,
}: {
  item: TrendingPostItem;
  onLike: () => void;
  onSave: () => void;
}): JSX.Element {
  const navigate = useNavigate();
  return (
    <article
      className="bg-white border border-border rounded-lg p-4 sm:p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200 group cursor-pointer"
      onClick={() => navigate(`/articles/${item.id}`)}
    >
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
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
            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0 flex items-center gap-1">
              <LuFileText className="w-2.5 h-2.5" /> Post
            </span>
          </div>
          <h3 className="text-[15px] font-bold text-text leading-snug tracking-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-[12px] text-text/55 leading-relaxed line-clamp-2 mb-2.5">
            {item.excerpt}
          </p>
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} variant="neutral" size="sm" clickable>
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
              <span className="font-medium">{item.likes}</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-text/40 hover:text-primary transition-colors cursor-pointer"
            >
              <HiOutlineChatBubbleOvalLeft className="w-3.5 h-3.5" />
              <span className="font-medium">{item.comments}</span>
            </button>
            <button
              type="button"
              onClick={onSave}
              className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${item.saved ? "text-primary" : "text-text/40 hover:text-primary"}`}
            >
              <HiOutlineBookmark className="w-3.5 h-3.5" />
              <span className="font-medium">{item.saved ? "Saved" : "Save"}</span>
            </button>
            <span className="ml-auto text-[11px] text-text/40 font-medium">{item.readTime}</span>
          </div>
        </div>
        {item.coverImage && (
          <div className="hidden sm:block w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-border/30">
            <img
              src={item.coverImage}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400&auto=format&fit=crop";
              }}
            />
          </div>
        )}
      </div>
    </article>
  );
}
