import { useState, useEffect, useCallback, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineHeart,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineBookmark,
  HiHeart,
} from "react-icons/hi2";
import { BsThreeDots } from "react-icons/bs";
import { Avatar, Tag, Skeleton } from "@/components/common";
import {
  getFeedArticles,
  getFollowingArticles,
  getTrendingArticles,
  likeArticle,
  saveArticle,
  type Article,
  type Pagination,
} from "@/features/articles/api/articleApi";
import {
  HeroBanner,
  FeedTabs,
  TrendingDiscussionsWidget,
  PopularResourcesWidget,
  PaginationDots,
  type TrendingDiscussion,
} from "@/features/articles/components";

interface Author {
  name: string;
  title: string;
  avatarUrl?: string;
  badge?: string;
}

interface ArticleFeedItem {
  id: string;
  author: Author;
  date: string;
  title: string;
  description: string;
  tags: { label: string; variant: "primary" | "teal" | "neutral" | "outline" }[];
  likes: number;
  comments: number;
  readTime: string;
  coverImage: string;
  liked?: boolean;
  saved?: boolean;
}

const MOCK_ARTICLES: ArticleFeedItem[] = [
  {
    id: "1",
    author: {
      name: "Aisha Khan",
      title: "Senior Frontend Engineer @ Acme Co.",
      badge: "Staff",
    },
    date: "May 12",
    title: "Designing resilient React applications with TanStack Query",
    description:
      "Learn practical patterns for data fetching, caching, mutations, and background synchronization that make your React apps feel fast and dependable.",
    tags: [
      { label: "React", variant: "primary" },
      { label: "TanStack Query", variant: "teal" },
      { label: "TypeScript", variant: "neutral" },
      { label: "Performance", variant: "outline" },
    ],
    likes: 412,
    comments: 36,
    readTime: "8 min read",
    coverImage: "/article-react-tanstack.jpg",
    liked: false,
    saved: false,
  },
  {
    id: "2",
    author: {
      name: "Marcus Lee",
      title: "Backend Engineer @ ShipFast",
    },
    date: "May 9",
    title: "What I learned deploying Node.js with blue-green releases",
    description:
      "A practical guide to zero-downtime deployments using blue-green strategy, Health checks, and automatic rollback with real-world gotchas.",
    tags: [
      { label: "Node.js", variant: "teal" },
      { label: "DevOps", variant: "primary" },
      { label: "Docker", variant: "neutral" },
      { label: "CI/CD", variant: "outline" },
    ],
    likes: 298,
    comments: 24,
    readTime: "10 min read",
    coverImage: "/article-nodejs-deploy.jpg",
    liked: false,
    saved: false,
  },
];

function mapApiArticleToFeedItem(art: Article): ArticleFeedItem {
  const authorName = art.author?.name || art.author?.userName || art.authorName || "DevSpace Author";
  const authorTitle = art.author?.userName ? `@${art.author.userName}` : "Developer";
  const formattedDate = art.createdAt
    ? new Date(art.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Recently";

  const rawTags = art.tags || art.tagNames || [];
  const variants: ("primary" | "teal" | "neutral" | "outline")[] = [
    "primary",
    "teal",
    "neutral",
    "outline",
  ];
  const tagsList = rawTags.map((t, idx) => ({
    label: t,
    variant: variants[idx % variants.length],
  }));

  return {
    id: art.id,
    author: {
      name: authorName,
      title: authorTitle,
      avatarUrl: art.author?.avatarUrl || undefined,
    },
    date: formattedDate,
    title: art.title || "Untitled Article",
    description: art.excerpt || art.content?.slice(0, 140) || "",
    tags: tagsList,
    likes: art.likeCount ?? art.likes ?? 0,
    comments: art.commentCount ?? art.comments ?? 0,
    readTime: `${art.readingTimeMinutes ?? art.readingTime ?? 4} min read`,
    coverImage: art.coverImageUrl || art.coverImage || "/article-react-tanstack.jpg",
    liked: Boolean(art.liked ?? art.isLiked),
    saved: Boolean(art.saved ?? art.isBookmarked),
  };
}

function HomeArticleCard({
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
              <Tag
                key={tag.label}
                variant={tag.variant}
                size="sm"
                clickable
              >
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
              article.liked
                ? "text-rose-500"
                : "text-text/45 hover:text-rose-500"
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
              article.saved
                ? "text-primary"
                : "text-text/45 hover:text-primary"
            }`}
          >
            <HiOutlineBookmark className="w-4 h-4" />
            <span className="font-medium">{article.saved ? "Saved" : "Save"}</span>
          </button>
        </div>

        <span className="text-[11px] text-text/40 font-medium">
          {article.readTime}
        </span>
      </div>
    </article>
  );
}

export function HomePage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>("For You");
  const [articles, setArticles] = useState<ArticleFeedItem[]>(MOCK_ARTICLES);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [trendingSidebarItems, setTrendingSidebarItems] = useState<TrendingDiscussion[]>([]);

  const fetchArticles = useCallback(async (tab: string, page: number): Promise<void> => {
    setIsLoading(true);
    try {
      if (tab === "Following") {
        const response = await getFollowingArticles({ page, pageSize: 10 });
        if (response.data && response.data.length > 0) {
          setArticles(response.data.map(mapApiArticleToFeedItem));
          setPagination(response.pagination || null);
        } else {
          setArticles([]);
          setPagination(response.pagination || null);
        }
      } else if (tab === "Trending") {
        const response = await getTrendingArticles({ page, pageSize: 10 });
        if (response.data && response.data.length > 0) {
          setArticles(response.data.map(mapApiArticleToFeedItem));
          setPagination(response.pagination || null);
        } else {
          setArticles([]);
          setPagination(response.pagination || null);
        }
      } else if (tab === "Latest") {
        const response = await getFeedArticles({ page, pageSize: 10 });
        if (response.data && response.data.length > 0) {
          setArticles(response.data.map(mapApiArticleToFeedItem));
          setPagination(response.pagination || null);
        } else {
          setArticles([]);
          setPagination(response.pagination || null);
        }
      } else {
        const response = await getFeedArticles({ page, pageSize: 10 });
        if (response.data && response.data.length > 0) {
          setArticles(response.data.map(mapApiArticleToFeedItem));
          setPagination(response.pagination || null);
        } else {
          setArticles(MOCK_ARTICLES);
          setPagination(null);
        }
      }
    } catch {
      if (tab === "For You") {
        setArticles(MOCK_ARTICLES);
      } else {
        setArticles([]);
      }
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function loadSidebarTrending(): Promise<void> {
      try {
        const res = await getTrendingArticles({ page: 1, pageSize: 5 });
        if (active && res.data && res.data.length > 0) {
          const mapped: TrendingDiscussion[] = res.data.slice(0, 5).map((item, i) => {
            const colors = [
              "bg-violet-500",
              "bg-emerald-500",
              "bg-sky-500",
              "bg-amber-500",
              "bg-rose-500",
            ];
            const author = item.author?.name || item.author?.userName || "Author";
            return {
              id: item.id,
              title: item.title,
              author,
              timeAgo: item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Recently",
              replies: item.commentCount ?? 0,
              avatarColor: colors[i % colors.length],
            };
          });
          setTrendingSidebarItems(mapped);
        }
      } catch {
      }
    }
    void loadSidebarTrending();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    void fetchArticles(activeTab, 1);
  }, [activeTab, fetchArticles]);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    void fetchArticles(activeTab, page);
  };

  const handleLike = async (id: string): Promise<void> => {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, liked: !a.liked, likes: a.liked ? a.likes - 1 : a.likes + 1 }
          : a,
      ),
    );
    try {
      await likeArticle(id);
    } catch {
    }
  };

  const handleSave = async (id: string): Promise<void> => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, saved: !a.saved } : a)),
    );
    try {
      await saveArticle(id);
    } catch {
    }
  };

  const totalPages = pagination?.totalPages || (articles.length > 0 ? 1 : 0);
  const activePageIndex = (pagination?.currentPage || currentPage) - 1;

  return (
    <div className="w-full max-w-[1200px] mx-auto font-inter">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          <HeroBanner />
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="space-y-4 min-h-[300px]">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-white border border-border rounded-lg p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton variant="circular" width={36} height={36} />
                      <div className="space-y-1">
                        <Skeleton variant="text" width={120} height={14} />
                        <Skeleton variant="text" width={80} height={10} />
                      </div>
                    </div>
                    <Skeleton variant="text" width="90%" height={20} />
                    <Skeleton variant="text" width="100%" height={14} />
                    <div className="flex gap-2">
                      <Skeleton variant="rounded" width={60} height={20} />
                      <Skeleton variant="rounded" width={60} height={20} />
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-white border border-border rounded-lg p-10 text-center space-y-2">
                <p className="text-base font-semibold text-text">No articles found in {activeTab}</p>
                <p className="text-xs text-text/50">
                  {activeTab === "Following"
                    ? "Follow authors to see their latest articles here."
                    : "Check back later for updates."}
                </p>
              </div>
            ) : (
              articles.map((article) => (
                <HomeArticleCard
                  key={article.id}
                  article={article}
                  onLike={() => handleLike(article.id)}
                  onSave={() => handleSave(article.id)}
                />
              ))
            )}
          </div>

          {!isLoading && totalPages > 1 && (
            <PaginationDots
              total={totalPages}
              active={activePageIndex}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        <aside className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 shrink-0">
          <TrendingDiscussionsWidget discussions={trendingSidebarItems} />
          <PopularResourcesWidget />
        </aside>
      </div>
    </div>
  );
}

export default HomePage;
