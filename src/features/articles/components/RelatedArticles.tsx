import { useState, useEffect, type JSX } from "react";
import { Link } from "react-router-dom";
import { Skeleton, Tag } from "@/components/common";
import { toast } from "@/hooks/useToast";
import { getArticles, type Article } from "@/features/articles/api/articleApi";
import articlePlaceholder from "@/assets/images/article-placeholder.jpg";

interface RelatedArticlesProps {
  currentArticleId: string;
}

export function RelatedArticles({
  currentArticleId,
}: RelatedArticlesProps): JSX.Element {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRelated() {
      try {
        setIsLoading(true);
        const data = await getArticles();
        
        // Filter out current article and get 3 related articles
        const related = data
          .filter((article) => article.id !== currentArticleId && article.status === "published")
          .slice(0, 3);
        
        setArticles(related);
      } catch {
        toast.error("Failed to load related articles");
      } finally {
        setIsLoading(false);
      }
    }

    loadRelated();
  }, [currentArticleId]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
      <h3 className="font-bold text-base text-gray-900">Related articles</h3>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="rounded" width="100%" height={120} />
              <Skeleton variant="text" width="100%" height={12} count={2} />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No related articles found
        </p>
      ) : (
        <div className="space-y-5">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/articles/${article.id}`}
              className="group block space-y-2 hover:opacity-80 transition-opacity"
            >
              {/* Cover image */}
              <div className="relative overflow-hidden rounded-lg h-24 bg-gray-100">
                <img
                  src={article.coverImage || articlePlaceholder}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = articlePlaceholder;
                  }}
                />
              </div>

              {/* Title */}
              <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h4>

              {/* Tags */}
              {article.tagNames && article.tagNames.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {article.tagNames.slice(0, 2).map((tag) => (
                    <Tag
                      key={tag}
                      variant="outline"
                      size="sm"
                    >
                      {tag}
                    </Tag>
                  ))}
                  {article.tagNames.length > 2 && (
                    <span className="text-xs text-gray-400">
                      +{article.tagNames.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Meta */}
              <p className="text-xs text-gray-400">
                {new Date(article.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </Link>
          ))}

          {/* View all articles link */}
          <Link
            to="/articles"
            className="block text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline text-center py-2"
          >
            View all articles →
          </Link>
        </div>
      )}
    </div>
  );
}

export default RelatedArticles;
