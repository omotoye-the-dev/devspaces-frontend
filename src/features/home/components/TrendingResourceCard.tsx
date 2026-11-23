import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "@/shared/ui";
import type { TrendingResourceItem } from "@/features/home/types";
import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import { LuPackage } from "react-icons/lu";

export function TrendingResourceCard({ item }: { item: TrendingResourceItem }): JSX.Element {
  const navigate = useNavigate();
  return (
    <article
      className="bg-white border border-border rounded-lg p-4 sm:p-5 hover:border-emerald-300 hover:shadow-sm transition-all duration-200 group cursor-pointer"
      onClick={() => navigate(`/resources/${item.id}`)}
    >
      <div className="flex gap-3">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 overflow-hidden flex items-center justify-center">
          {item.logoUrl ? (
            <img src={item.logoUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <LuPackage className="w-5 h-5 text-emerald-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="text-[14px] font-bold text-text leading-tight group-hover:text-emerald-700 transition-colors truncate">
                {item.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1">
                  <LuPackage className="w-2.5 h-2.5" /> Resource
                </span>
                <span className="text-[11px] text-text/40">
                  {item.category} · {item.date}
                </span>
              </div>
            </div>
            <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-text/30 group-hover:text-emerald-600 transition-colors shrink-0 mt-0.5" />
          </div>
          <p className="text-[12px] text-text/55 leading-relaxed line-clamp-2 mb-2">
            {item.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {item.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} variant="teal" size="sm" clickable>
                {tag}
              </Tag>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-text/40">
            <span>{item.upvotes} upvotes</span>
            <span>·</span>
            <span>{item.downloads} downloads</span>
            <span>·</span>
            <span>by {item.uploaderName}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
