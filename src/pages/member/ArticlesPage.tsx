import { useState, useEffect, useMemo, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineSearch } from "react-icons/md";
import { LuPenLine, LuLayoutGrid, LuLayoutList } from "react-icons/lu";
import { FiFilter } from "react-icons/fi";
import { Button, Input, Skeleton } from "@/components/common";
import { getArticles, likeArticle } from "@/features/articles/api/articleApi";
import type { Article } from "@/features/articles/api/articleApi";
import { getTags } from "@/features/articles/api/tagApi";
import { ArticleCard } from "@/features/articles/components/ArticleCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/useToast";

interface DisplayArticle {
  id: string;
  title: string;
  excerpt: string;
  tagNames: string[];
  category?: string;
  coverImage?: string;
  status?: "draft" | "published" | "scheduled" | "archived";
  authorName?: string;
  authorAvatar?: string;
  createdAt: string;
  readTimeMinutes?: number;
}

function mapArticle(art: Article, fallbackAuthor: string): DisplayArticle {
  return {
    id: art.id,
    title: art.title || "Untitled Article",
    excerpt: art.excerpt || art.content || "",
    tagNames: art.tagNames || [],
    category: art.series || "General",
    coverImage: art.coverImage,
    status: art.status,
    authorName: fallbackAuthor,
    createdAt: art.createdAt || new Date().toISOString(),
    readTimeMinutes:
      art.readingTime ?? Math.max(1, Math.ceil((art.content?.length || 0) / 500)),
  };
}

export function ArticlesPage(): JSX.Element {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [layout, setLayout] = useState<"list" | "grid">("list");

  // Fetch articles
  useEffect(() => {
    let isSubscribed = true;

    async function loadFeed() {
      try {
        setIsLoading(true);
        const data = await getArticles();
        if (isSubscribed) {
          setArticles(
            data.map((art) => mapArticle(art, user?.username || "DevSpace Author")),
          );
        }
      } catch {
        if (isSubscribed) {
          setArticles([]);
          toast.error("Failed to load articles. Please try again later.");
        }
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    loadFeed();
    return () => { isSubscribed = false; };
  }, [user]);

  // Fetch tags for filter pills
  useEffect(() => {
    async function loadTags() {
      try {
        const tags = await getTags();
        if (tags.length > 0) {
          setCategories(["All", ...tags.map((t) => t.name)]);
        }
      } catch {
        // Silently fall back — "All" is always present
      }
    }
    loadTags();
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.success("Removed from bookmarks");
      } else {
        next.add(id);
        toast.success("Saved to bookmarks");
      }
      return next;
    });
  };

  const handleLike = async (articleId: string): Promise<void> => {
    await likeArticle(articleId);
  };

  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return articles.filter((art) => {
      const matchesSearch =
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.tagNames.some((t) => t.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "All" ||
        art.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        art.tagNames.some((t) => t.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight">
            Technical Articles
          </h1>
          <p className="text-text/60 text-sm">
            Curated guides, architectural insights, and tutorials written by developers.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<LuPenLine className="w-4 h-4" />}
          onClick={() => navigate("/articles/new")}
          className="shrink-0 font-semibold w-full sm:w-auto"
        >
          Write Article
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keyword or tag..."
            inputSize="md"
            leftIcon={<MdOutlineSearch className="text-text/40 text-lg" />}
            className="bg-white border-border"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <FiFilter className="w-4 h-4 text-text/40 shrink-0 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white border border-border text-text/70 hover:bg-slate-50 hover:text-text"
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Layout toggle */}
          <div className="flex items-center bg-white border border-border rounded-lg overflow-hidden shrink-0 ml-1">
            <button
              type="button"
              id="layout-list"
              onClick={() => setLayout("list")}
              title="List view"
              className={`p-2 transition-colors ${
                layout === "list"
                  ? "bg-primary text-white"
                  : "text-text/50 hover:bg-slate-50 hover:text-text"
              }`}
            >
              <LuLayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="layout-grid"
              onClick={() => setLayout("grid")}
              title="Grid view"
              className={`p-2 transition-colors ${
                layout === "grid"
                  ? "bg-primary text-white"
                  : "text-text/50 hover:bg-slate-50 hover:text-text"
              }`}
            >
              <LuLayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading skeletons */}
      {isLoading ? (
        layout === "list" ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-border rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Skeleton variant="circular" width={36} height={36} />
                  <div className="space-y-1">
                    <Skeleton variant="text" width={120} height={14} />
                    <Skeleton variant="text" width={160} height={12} />
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-5">
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="85%" height={20} />
                    <Skeleton variant="text" width="100%" height={14} />
                    <Skeleton variant="text" width="70%" height={14} />
                    <div className="flex gap-2 pt-1">
                      <Skeleton variant="rounded" width={60} height={22} />
                      <Skeleton variant="rounded" width={60} height={22} />
                    </div>
                  </div>
                  <Skeleton variant="rounded" width={176} height={112} className="hidden sm:block shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs"
              >
                <Skeleton variant="rectangular" width="100%" height={180} />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton variant="circular" width={28} height={28} />
                    <Skeleton variant="text" width={100} height={12} />
                  </div>
                  <Skeleton variant="text" width="90%" height={16} />
                  <Skeleton variant="text" width="100%" height={12} />
                  <Skeleton variant="text" width="60%" height={12} />
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredArticles.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white border border-border rounded-2xl text-center p-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <LuPenLine className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-bold text-text">No articles found</h3>
            <p className="text-xs text-text/60">
              {searchQuery || selectedCategory !== "All"
                ? "Nothing matched your search or filter. Try clearing them."
                : "No articles have been published yet. Be the first to write one!"}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            {(searchQuery || selectedCategory !== "All") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<LuPenLine className="w-4 h-4" />}
              onClick={() => navigate("/articles/new")}
            >
              Write Article
            </Button>
          </div>
        </div>
      ) : layout === "list" ? (
        /* Feed list */
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              id={article.id}
              title={article.title}
              excerpt={article.excerpt}
              tagNames={article.tagNames}
              coverImage={article.coverImage}
              authorName={article.authorName}
              createdAt={article.createdAt}
              readTimeMinutes={article.readTimeMinutes}
              isBookmarked={bookmarkedIds.has(article.id)}
              onBookmark={() => toggleBookmark(article.id)}
              onLike={handleLike}
              variant="horizontal"
            />
          ))}
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              id={article.id}
              title={article.title}
              excerpt={article.excerpt}
              tagNames={article.tagNames}
              coverImage={article.coverImage}
              authorName={article.authorName}
              createdAt={article.createdAt}
              readTimeMinutes={article.readTimeMinutes}
              isBookmarked={bookmarkedIds.has(article.id)}
              onBookmark={() => toggleBookmark(article.id)}
              onLike={handleLike}
              variant="vertical"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ArticlesPage;
