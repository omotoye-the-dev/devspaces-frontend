import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Tag } from "@/shared/ui";
import type { ArticleFeedItem } from "@/features/home/types";
import {
  HiOutlineHeart,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineBookmark,
  HiHeart,
} from "react-icons/hi2";
import { BsThreeDots } from "react-icons/bs";

export function HomeArticleCard({
  article,
  onLike,
  onSave,
}: {
  article: ArticleFeedItem;
  onLike: () => void;
  onSave: () => void;
}): JSX.Element {
  const navigate = useNavigate();

  return (
    <article className="bg-white border border-border rounded-lg p-4 sm:p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            src={article.author.avatarUrl}
            name={article.author.name}
            size="sm"
            href={null}
            className="shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-text truncate">
                {article.author.name}
              </span>
              {article.author.badge && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wide shrink-0">
                  {article.author.badge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-text/45 truncate">
              {article.author.title} · {article.date}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="p-1.5 rounded-md text-text/30 hover:text-text/60 hover:bg-border/40 transition-colors cursor-pointer shrink-0"
          aria-label="More options"
        >
          <BsThreeDots className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <h3
            className="text-base sm:text-[17px] font-bold text-text leading-snug tracking-tight mb-1.5 cursor-pointer hover:text-primary transition-colors line-clamp-2"
            onClick={() => navigate(`/articles/${article.id}`)}
          >
            {article.title}
          </h3>
          <p className="text-[13px] text-text/55 leading-relaxed line-clamp-2 mb-3">
            {article.description}
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            {article.tags.map((tag) => (
              <Tag key={tag.label} variant={tag.variant} size="sm" clickable>
                {tag.label}
              </Tag>
            ))}
          </div>
        </div>

        <div className="hidden sm:block w-28 h-28 md:w-32 md:h-32 rounded-lg overflow-hidden shrink-0 bg-border/30">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400&auto=format&fit=crop";
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border/50">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onLike}
            className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
              article.liked ? "text-rose-500" : "text-text/45 hover:text-rose-500"
            }`}
          >
            {article.liked ? (
              <HiHeart className="w-4 h-4" />
            ) : (
              <HiOutlineHeart className="w-4 h-4" />
            )}
            <span className="font-medium">{article.likes}</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-text/45 hover:text-primary transition-colors cursor-pointer"
          >
            <HiOutlineChatBubbleOvalLeft className="w-4 h-4" />
            <span className="font-medium">{article.comments}</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
              article.saved ? "text-primary" : "text-text/45 hover:text-primary"
            }`}
          >
            <HiOutlineBookmark className="w-4 h-4" />
            <span className="font-medium">{article.saved ? "Saved" : "Save"}</span>
          </button>
        </div>

        <span className="text-[11px] text-text/40 font-medium">{article.readTime}</span>
      </div>
    </article>
  );
}
