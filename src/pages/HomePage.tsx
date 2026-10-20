import { useState, useEffect, useCallback, useRef, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineHeart,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineBookmark,
  HiHeart,
  HiOutlineFire,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { BsThreeDots } from "react-icons/bs";
import { LuFileText, LuMessageSquare, LuPackage } from "react-icons/lu";
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
  type TrendingDiscussion,
} from "@/features/articles/components";
import {
  getDiscussions,
  likeDiscussion,
} from "@/features/discussions/api/discussionApi";
import { getResources } from "@/features/resources/api/resources.api";
import type { Discussion } from "@/types/discussions.types";
import type { ResourceListItem } from "@/types/resources.types";
import { getUserProfile, isProfileComplete } from "@/lib/api/user.api";
import { OnboardingModal } from "@/features/onboarding/components/OnboardingModal";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { LoginPrompt } from "@/components/shared/LoginPrompt";

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

interface TrendingPostItem {
  kind: "post";
  id: string; title: string; excerpt: string; coverImage?: string;
  authorName: string; authorAvatar?: string; date: string; tags: string[];
  likes: number; comments: number; readTime: string; liked: boolean; saved: boolean;
}

interface TrendingDiscussionItem {
  kind: "discussion";
  id: string; title: string; content: string;
  authorName: string; authorAvatar?: string; date: string; tags: string[];
  upvotes: number; comments: number; liked: boolean;
}

interface TrendingResourceItem {
  kind: "resource";
  id: string; title: string; description: string; category: string; logoUrl?: string;
  uploaderName: string; uploaderAvatar?: string; date: string; tags: string[];
  upvotes: number; downloads: number; saved: boolean;
}

type TrendingFeedItem = TrendingPostItem | TrendingDiscussionItem | TrendingResourceItem;
type TrendingFilter = "All" | "Posts" | "Discussions" | "Resources";

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

function mapTrendingPost(art: Article): TrendingPostItem {
  return { kind: "post", id: art.id, title: art.title || "Untitled", excerpt: art.excerpt || art.content?.slice(0, 160) || "", coverImage: art.coverImageUrl || art.coverImage || undefined, authorName: art.author?.name || art.author?.userName || art.authorName || "DevSpace Author", authorAvatar: art.author?.avatarUrl || undefined, date: art.createdAt ? new Date(art.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently", tags: art.tags || art.tagNames || [], likes: art.likeCount ?? art.likes ?? 0, comments: art.commentCount ?? art.comments ?? 0, readTime: `${art.readingTimeMinutes ?? art.readingTime ?? 4} min read`, liked: Boolean(art.liked ?? art.isLiked), saved: Boolean(art.saved ?? art.isBookmarked) };
}

function mapTrendingDiscussion(d: Discussion): TrendingDiscussionItem {
  return { kind: "discussion", id: d.id, title: d.title, content: d.content?.slice(0, 200) || "", authorName: d.author?.name || d.author?.username || "DevSpace", authorAvatar: d.author?.avatarUrl || undefined, date: d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently", tags: d.tags || [], upvotes: d.upvotes ?? d.likeCount ?? 0, comments: d.commentsCount ?? 0, liked: Boolean(d.isLiked) };
}

function mapTrendingResource(r: ResourceListItem): TrendingResourceItem {
  return { kind: "resource", id: r.id, title: r.title, description: r.description?.slice(0, 160) || "", category: r.category || "General", logoUrl: r.logoUrl || undefined, uploaderName: r.uploader?.name || r.uploader?.username || "DevSpace", uploaderAvatar: r.uploader?.avatarUrl || undefined, date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently", tags: r.tags?.map((t) => t.name) || [], upvotes: r.upvoteCount ?? 0, downloads: r.downloadCount ?? 0, saved: Boolean(r.isSavedByMe) };
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

function TrendingPostCard({ item, onLike, onSave }: { item: TrendingPostItem; onLike: () => void; onSave: () => void }): JSX.Element {
  const navigate = useNavigate();
  return (
    <article className="bg-white border border-border rounded-lg p-4 sm:p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200 group cursor-pointer" onClick={() => navigate(`/articles/${item.id}`)}>
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Avatar src={item.authorAvatar} name={item.authorName} size="sm" href={null} className="shrink-0" />
            <div className="min-w-0 flex-1"><span className="text-[12px] font-semibold text-text truncate block">{item.authorName}</span><span className="text-[11px] text-text/40">{item.date}</span></div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0 flex items-center gap-1"><LuFileText className="w-2.5 h-2.5" /> Post</span>
          </div>
          <h3 className="text-[15px] font-bold text-text leading-snug tracking-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
          <p className="text-[12px] text-text/55 leading-relaxed line-clamp-2 mb-2.5">{item.excerpt}</p>
          <div className="flex flex-wrap gap-1 mb-3">{item.tags.slice(0, 3).map((tag) => <Tag key={tag} variant="neutral" size="sm" clickable>{tag}</Tag>)}</div>
          <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={onLike} className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${item.liked ? "text-rose-500" : "text-text/40 hover:text-rose-500"}`}>{item.liked ? <HiHeart className="w-3.5 h-3.5" /> : <HiOutlineHeart className="w-3.5 h-3.5" />}<span className="font-medium">{item.likes}</span></button>
            <button type="button" className="flex items-center gap-1.5 text-xs text-text/40 hover:text-primary transition-colors cursor-pointer"><HiOutlineChatBubbleOvalLeft className="w-3.5 h-3.5" /><span className="font-medium">{item.comments}</span></button>
            <button type="button" onClick={onSave} className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${item.saved ? "text-primary" : "text-text/40 hover:text-primary"}`}><HiOutlineBookmark className="w-3.5 h-3.5" /><span className="font-medium">{item.saved ? "Saved" : "Save"}</span></button>
            <span className="ml-auto text-[11px] text-text/40 font-medium">{item.readTime}</span>
          </div>
        </div>
        {item.coverImage && <div className="hidden sm:block w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-border/30"><img src={item.coverImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400&auto=format&fit=crop"; }} /></div>}
      </div>
    </article>
  );
}

function TrendingDiscussionCard({ item, onLike }: { item: TrendingDiscussionItem; onLike: () => void }): JSX.Element {
  const navigate = useNavigate();
  return (
    <article className="bg-white border border-border rounded-lg p-4 sm:p-5 hover:border-violet-300 hover:shadow-sm transition-all duration-200 group cursor-pointer" onClick={() => navigate(`/discussions/${item.id}`)}>
      <div className="flex items-center gap-2 mb-2">
        <Avatar src={item.authorAvatar} name={item.authorName} size="sm" href={null} className="shrink-0" />
        <div className="min-w-0 flex-1"><span className="text-[12px] font-semibold text-text truncate block">{item.authorName}</span><span className="text-[11px] text-text/40">{item.date}</span></div>
        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0 flex items-center gap-1"><LuMessageSquare className="w-2.5 h-2.5" /> Discussion</span>
      </div>
      <h3 className="text-[15px] font-bold text-text leading-snug tracking-tight mb-1 group-hover:text-violet-600 transition-colors line-clamp-2">{item.title}</h3>
      <p className="text-[12px] text-text/55 leading-relaxed line-clamp-2 mb-2.5">{item.content}</p>
      <div className="flex flex-wrap gap-1 mb-3">{item.tags.slice(0, 3).map((tag) => <Tag key={tag} variant="outline" size="sm" clickable>{tag}</Tag>)}</div>
      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onLike} className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${item.liked ? "text-rose-500" : "text-text/40 hover:text-rose-500"}`}>{item.liked ? <HiHeart className="w-3.5 h-3.5" /> : <HiOutlineHeart className="w-3.5 h-3.5" />}<span className="font-medium">{item.upvotes}</span></button>
        <button type="button" className="flex items-center gap-1.5 text-xs text-text/40 hover:text-violet-600 transition-colors cursor-pointer"><HiOutlineChatBubbleOvalLeft className="w-3.5 h-3.5" /><span className="font-medium">{item.comments}</span></button>
      </div>
    </article>
  );
}

function TrendingResourceCard({ item }: { item: TrendingResourceItem }): JSX.Element {
  const navigate = useNavigate();
  return (
    <article className="bg-white border border-border rounded-lg p-4 sm:p-5 hover:border-emerald-300 hover:shadow-sm transition-all duration-200 group cursor-pointer" onClick={() => navigate(`/resources/${item.id}`)}>
      <div className="flex gap-3">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 overflow-hidden flex items-center justify-center">{item.logoUrl ? <img src={item.logoUrl} alt={item.title} className="w-full h-full object-cover" /> : <LuPackage className="w-5 h-5 text-emerald-600" />}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="text-[14px] font-bold text-text leading-tight group-hover:text-emerald-700 transition-colors truncate">{item.title}</h3>
              <div className="flex items-center gap-1.5 mt-0.5"><span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1"><LuPackage className="w-2.5 h-2.5" /> Resource</span><span className="text-[11px] text-text/40">{item.category} · {item.date}</span></div>
            </div>
            <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-text/30 group-hover:text-emerald-600 transition-colors shrink-0 mt-0.5" />
          </div>
          <p className="text-[12px] text-text/55 leading-relaxed line-clamp-2 mb-2">{item.description}</p>
          <div className="flex flex-wrap gap-1 mb-2">{item.tags.slice(0, 3).map((tag) => <Tag key={tag} variant="teal" size="sm" clickable>{tag}</Tag>)}</div>
          <div className="flex items-center gap-3 text-[11px] text-text/40"><span>{item.upvotes} upvotes</span><span>·</span><span>{item.downloads} downloads</span><span>·</span><span>by {item.uploaderName}</span></div>
        </div>
      </div>
    </article>
  );
}

function FeedSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="bg-white border border-border rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-3"><Skeleton variant="circular" width={36} height={36} /><div className="space-y-1"><Skeleton variant="text" width={120} height={14} /><Skeleton variant="text" width={80} height={10} /></div></div>
          <Skeleton variant="text" width="90%" height={20} />
          <Skeleton variant="text" width="100%" height={14} />
          <div className="flex gap-2"><Skeleton variant="rounded" width={60} height={20} /><Skeleton variant="rounded" width={60} height={20} /></div>
        </div>
      ))}
    </div>
  );
}

const PAGE_SIZE = 10;
const TRENDING_FILTERS: { label: TrendingFilter; icon: JSX.Element }[] = [
  { label: "All", icon: <HiOutlineFire className="w-3.5 h-3.5" /> },
  { label: "Posts", icon: <LuFileText className="w-3.5 h-3.5" /> },
  { label: "Discussions", icon: <LuMessageSquare className="w-3.5 h-3.5" /> },
  { label: "Resources", icon: <LuPackage className="w-3.5 h-3.5" /> },
];

export function HomePage(): JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const requireAuth = useRequireAuth();
  // Regular feed
  const [activeTab, setActiveTab] = useState<string>("For You");
  const [articles, setArticles] = useState<ArticleFeedItem[]>(MOCK_ARTICLES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const nextPageRef = useRef<number>(1);
  const activeTabRef = useRef<string>("For You");
  const sentinelRef = useRef<HTMLDivElement>(null);
  // The Following feed and Trending (posts + discussions) endpoints require a session
  const isGuestGated = !isAuthenticated && (activeTab === "Following" || activeTab === "Trending");

  // Trending-specific
  const [trendingFilter, setTrendingFilter] = useState<TrendingFilter>("All");
  const [trendingPosts, setTrendingPosts] = useState<TrendingPostItem[]>([]);
  const [trendingDiscussions, setTrendingDiscussions] = useState<TrendingDiscussionItem[]>([]);
  const [trendingResources, setTrendingResources] = useState<TrendingResourceItem[]>([]);
  const trendingPostsPageRef = useRef(1);
  const trendingDiscPageRef = useRef(1);
  const trendingResPageRef = useRef(1);
  // Ref for use inside callbacks, mirrored into state so render never reads the ref
  const hasMoreTrendingRef = useRef({ posts: true, disc: true, res: true });
  const [hasMoreTrending, setHasMoreTrending] = useState({ posts: true, disc: true, res: true });
  const updateHasMore = useCallback((key: "posts" | "disc" | "res", value: boolean): void => {
    hasMoreTrendingRef.current = { ...hasMoreTrendingRef.current, [key]: value };
    setHasMoreTrending(hasMoreTrendingRef.current);
  }, []);
  const [isTrendingInitLoading, setIsTrendingInitLoading] = useState(false);
  const [isTrendingFetchingMore, setIsTrendingFetchingMore] = useState(false);

  const [trendingSidebarItems, setTrendingSidebarItems] = useState<TrendingDiscussion[]>([]);
  const [isSidebarLoading, setIsSidebarLoading] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;

    getUserProfile()
      .then((profile) => {
        if (active && !isProfileComplete(profile)) {
          setShowOnboarding(true);
        }
      })
      .catch(() => {
        // Profile fetch failure: don't block the page with onboarding
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const fetchArticles = useCallback(async (tab: string, page: number, isInitial: boolean): Promise<void> => {
    if (isInitial) setIsLoading(true); else setIsFetchingMore(true);
    try {
      let response: { data: Article[]; pagination?: Pagination };
      if (tab === "Following") response = await getFollowingArticles({ page, pageSize: PAGE_SIZE });
      else response = await getFeedArticles({ page, pageSize: PAGE_SIZE });
      const incoming = response.data?.map(mapApiArticleToFeedItem) ?? [];
      const paginationInfo = response.pagination;
      if (isInitial) { setArticles(incoming.length > 0 ? incoming : (tab === "For You" ? MOCK_ARTICLES : [])); }
      else { setArticles((prev) => [...prev, ...incoming.filter((a) => !prev.some((p) => p.id === a.id))]); }
      const more = paginationInfo?.hasNext ?? (incoming.length === PAGE_SIZE);
      setHasMore(more);
      if (more) nextPageRef.current = page + 1;
    } catch {
      if (isInitial) setArticles(tab === "For You" ? MOCK_ARTICLES : []);
      setHasMore(false);
    } finally { if (isInitial) setIsLoading(false); else setIsFetchingMore(false); }
  }, []);

  const fetchTrendingInitial = useCallback(async () => {
    setIsTrendingInitLoading(true);
    trendingPostsPageRef.current = 1; trendingDiscPageRef.current = 1; trendingResPageRef.current = 1;
    updateHasMore("posts", true); updateHasMore("disc", true); updateHasMore("res", true);
    const [postsRes, discRes, resRes] = await Promise.allSettled([
      getTrendingArticles({ page: 1, pageSize: PAGE_SIZE }),
      getDiscussions({ sort: "trending", page: 1, pageSize: PAGE_SIZE }),
      getResources({ page: 1, pageSize: PAGE_SIZE } as Parameters<typeof getResources>[0]),
    ]);
    if (postsRes.status === "fulfilled") {
      const data = postsRes.value.data ?? [];
      setTrendingPosts(data.map(mapTrendingPost));
      updateHasMore("posts", postsRes.value.pagination?.hasNext ?? data.length >= PAGE_SIZE);
      if (hasMoreTrendingRef.current.posts) trendingPostsPageRef.current = 2;
    } else { setTrendingPosts([]); updateHasMore("posts", false); }
    if (discRes.status === "fulfilled") {
      const data = discRes.value;
      setTrendingDiscussions(data.map(mapTrendingDiscussion));
      updateHasMore("disc", data.length >= PAGE_SIZE);
      if (hasMoreTrendingRef.current.disc) trendingDiscPageRef.current = 2;
    } else { setTrendingDiscussions([]); updateHasMore("disc", false); }
    if (resRes.status === "fulfilled") {
      const data = resRes.value.data ?? [];
      setTrendingResources(data.map(mapTrendingResource));
      updateHasMore("res", resRes.value.pagination?.hasNext ?? data.length >= PAGE_SIZE);
      if (hasMoreTrendingRef.current.res) trendingResPageRef.current = 2;
    } else { setTrendingResources([]); updateHasMore("res", false); }
    setIsTrendingInitLoading(false);
  }, [updateHasMore]);

  const loadMoreTrending = useCallback(async () => {
    if (isTrendingFetchingMore || isTrendingInitLoading) return;
    const needPosts = (trendingFilter === "All" || trendingFilter === "Posts") && hasMoreTrendingRef.current.posts;
    const needDisc = (trendingFilter === "All" || trendingFilter === "Discussions") && hasMoreTrendingRef.current.disc;
    const needRes = (trendingFilter === "All" || trendingFilter === "Resources") && hasMoreTrendingRef.current.res;
    if (!needPosts && !needDisc && !needRes) return;
    setIsTrendingFetchingMore(true);
    const promises: Promise<void>[] = [];
    if (needPosts) {
      const page = trendingPostsPageRef.current;
      promises.push(getTrendingArticles({ page, pageSize: PAGE_SIZE }).then((res) => {
        const data = res.data ?? [];
        setTrendingPosts((prev) => [...prev, ...data.map(mapTrendingPost).filter((p) => !prev.some((x) => x.id === p.id))]);
        updateHasMore("posts", res.pagination?.hasNext ?? data.length >= PAGE_SIZE);
        if (hasMoreTrendingRef.current.posts) trendingPostsPageRef.current = page + 1;
      }).catch(() => { updateHasMore("posts", false); }));
    }
    if (needDisc) {
      const page = trendingDiscPageRef.current;
      promises.push(getDiscussions({ sort: "trending", page, pageSize: PAGE_SIZE }).then((data) => {
        setTrendingDiscussions((prev) => [...prev, ...data.map(mapTrendingDiscussion).filter((d) => !prev.some((x) => x.id === d.id))]);
        updateHasMore("disc", data.length >= PAGE_SIZE);
        if (hasMoreTrendingRef.current.disc) trendingDiscPageRef.current = page + 1;
      }).catch(() => { updateHasMore("disc", false); }));
    }
    if (needRes) {
      const page = trendingResPageRef.current;
      promises.push(getResources({ page, pageSize: PAGE_SIZE } as Parameters<typeof getResources>[0]).then((res) => {
        const data = res.data ?? [];
        setTrendingResources((prev) => [...prev, ...data.map(mapTrendingResource).filter((r) => !prev.some((x) => x.id === r.id))]);
        updateHasMore("res", res.pagination?.hasNext ?? data.length >= PAGE_SIZE);
        if (hasMoreTrendingRef.current.res) trendingResPageRef.current = page + 1;
      }).catch(() => { updateHasMore("res", false); }));
    }
    await Promise.allSettled(promises);
    setIsTrendingFetchingMore(false);
  }, [trendingFilter, isTrendingFetchingMore, isTrendingInitLoading, updateHasMore]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    async function loadSidebarTrending(): Promise<void> {
      try {
        const data = await getDiscussions({ page: 1, pageSize: 5 });
        if (!active) return;

        const mapped: TrendingDiscussion[] = data.slice(0, 5).map((item, i) => {
          const colors = [
            "bg-violet-500",
            "bg-emerald-500",
            "bg-sky-500",
            "bg-amber-500",
            "bg-rose-500",
          ];

          const author = item.author?.name || item.author?.username || "Author";

          return {
            id: item.id,
            title: item.title,
            author,
            username: item.author?.username,
            avatarUrl: item.author?.avatarUrl,
            timeAgo: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "Recently",
            replies: item.commentsCount ?? 0,
            avatarColor: colors[i % colors.length],
          };
        });

        setTrendingSidebarItems(mapped);
      } catch {
        if (active) {
          setTrendingSidebarItems([]);
        }
      } finally {
        if (active) setIsSidebarLoading(false);
      }
    }
    void loadSidebarTrending();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  // Tab switch
  useEffect(() => {
    activeTabRef.current = activeTab;
    if (isGuestGated) return;
    if (activeTab === "Trending") {
      queueMicrotask(() => { void fetchTrendingInitial(); });
    } else {
      nextPageRef.current = 1;
      queueMicrotask(() => {
        setHasMore(true);
        void fetchArticles(activeTab, 1, true);
      });
    }
  }, [activeTab, isGuestGated, fetchArticles, fetchTrendingInitial]);

  // Infinite scroll — regular feed
  useEffect(() => {
    if (activeTab === "Trending" || isGuestGated) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !isFetchingMore && !isLoading) {
        void fetchArticles(activeTabRef.current, nextPageRef.current, false);
      }
    }, { rootMargin: "200px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeTab, isGuestGated, hasMore, isFetchingMore, isLoading, fetchArticles]);

  // Infinite scroll — trending feed
  useEffect(() => {
    if (activeTab !== "Trending" || isGuestGated) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isTrendingInitLoading && !isTrendingFetchingMore) {
        void loadMoreTrending();
      }
    }, { rootMargin: "250px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeTab, isGuestGated, isTrendingInitLoading, isTrendingFetchingMore, loadMoreTrending]);

  const handleLike = async (id: string): Promise<void> => {
    if (!requireAuth("like this article")) return;
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
       // errors 
    }
  };

  const handleTrendingLikePost = async (id: string): Promise<void> => {
    if (!requireAuth("like this article")) return;
    setTrendingPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
    try { await likeArticle(id); } catch { /* silent */ }
  };
  const handleTrendingSavePost = async (id: string): Promise<void> => {
    if (!requireAuth("save this article")) return;
    setTrendingPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
    try { await saveArticle(id); } catch { /* silent */ }
  };
  const handleTrendingLikeDiscussion = async (id: string): Promise<void> => {
    if (!requireAuth("like this discussion")) return;
    setTrendingDiscussions((prev) => prev.map((d) => d.id === id ? { ...d, liked: !d.liked, upvotes: d.liked ? d.upvotes - 1 : d.upvotes + 1 } : d));
    try { await likeDiscussion(id); } catch { /* silent */ }
  };

  const handleSave = async (id: string): Promise<void> => {
    if (!requireAuth("save this article")) return;
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, saved: !a.saved } : a)),
    );
    try {
      await saveArticle(id);
    } catch {
      // errors 
    }
  };

  // Derived trending feed
  const trendingFeed: TrendingFeedItem[] = (() => {
    if (trendingFilter === "Posts") return trendingPosts;
    if (trendingFilter === "Discussions") return trendingDiscussions;
    if (trendingFilter === "Resources") return trendingResources;
    const maxLen = Math.max(trendingPosts.length, trendingDiscussions.length, trendingResources.length);
    const merged: TrendingFeedItem[] = [];
    for (let i = 0; i < maxLen; i++) {
      if (i < trendingPosts.length) merged.push(trendingPosts[i]);
      if (i < trendingDiscussions.length) merged.push(trendingDiscussions[i]);
      if (i < trendingResources.length) merged.push(trendingResources[i]);
    }
    return merged;
  })();

  const trendingHasMore =
    trendingFilter === "Posts"
      ? hasMoreTrending.posts
      : trendingFilter === "Discussions"
        ? hasMoreTrending.disc
        : trendingFilter === "Resources"
          ? hasMoreTrending.res
          : hasMoreTrending.posts || hasMoreTrending.disc || hasMoreTrending.res;

  return (
    <div className="w-full max-w-300 mx-auto font-inter">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          <HeroBanner />
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "Trending" && isAuthenticated && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {TRENDING_FILTERS.map(({ label, icon }) => (
                <button key={label} type="button" onClick={() => setTrendingFilter(label)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer border ${trendingFilter === label ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-text/60 border-border hover:border-primary/40 hover:text-text"}`}>{icon}{label}</button>
              ))}
            </div>
          )}

          <div className="space-y-4 min-h-75">
            {isGuestGated ? (
              <LoginPrompt
                icon={activeTab === "Following" ? <HiOutlineUserGroup className="w-6 h-6" /> : <HiOutlineFire className="w-6 h-6" />}
                title={activeTab === "Following" ? "Log in to see posts from people you follow" : "Log in to see what's trending"}
                description={activeTab === "Following" ? "Follow developers and their latest articles will show up here." : "Trending posts, discussions and resources from across DevSpace."}
              />
            ) : activeTab === "Trending" ? (
              isTrendingInitLoading ? <FeedSkeleton /> : trendingFeed.length === 0 ? (
                <div className="bg-white border border-border rounded-lg p-10 text-center space-y-2">
                  <HiOutlineFire className="w-7 h-7 text-text/20 mx-auto mb-1" />
                  <p className="text-base font-semibold text-text">Nothing trending yet</p>
                  <p className="text-xs text-text/50">Check back soon for hot content.</p>
                </div>
              ) : trendingFeed.map((item) => {
                if (item.kind === "post") return <TrendingPostCard key={`post-${item.id}`} item={item} onLike={() => handleTrendingLikePost(item.id)} onSave={() => handleTrendingSavePost(item.id)} />;
                if (item.kind === "discussion") return <TrendingDiscussionCard key={`disc-${item.id}`} item={item} onLike={() => handleTrendingLikeDiscussion(item.id)} />;
                return <TrendingResourceCard key={`res-${item.id}`} item={item} />;
              })
            ) : isLoading ? <FeedSkeleton /> : articles.length === 0 ? (
              <div className="bg-white border border-border rounded-lg p-10 text-center space-y-2">
                <p className="text-base font-semibold text-text">No articles found in {activeTab}</p>
                <p className="text-xs text-text/50">{activeTab === "Following" ? "Follow authors to see their latest articles here." : "Check back later for updates."}</p>
              </div>
            ) : articles.map((article) => <HomeArticleCard key={article.id} article={article} onLike={() => handleLike(article.id)} onSave={() => handleSave(article.id)} />)
            }
          </div>

          {/* Infinite scroll sentinel */}
          {!isGuestGated && <div ref={sentinelRef} className="h-4" aria-hidden="true" />}

          {/* Loading more indicator */}
          {isFetchingMore && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2.5 text-text/40">
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span className="text-xs font-medium">Loading more…</span>
              </div>
            </div>
          )}

          {activeTab !== "Trending" && !isLoading && !isFetchingMore && !hasMore && articles.length > 0 && (
            <div className="flex items-center justify-center py-6"><div className="flex items-center gap-2 text-text/30"><div className="h-px w-16 bg-border" /><span className="text-xs font-medium">You are all caught up</span><div className="h-px w-16 bg-border" /></div></div>
          )}
          {activeTab === "Trending" && !isTrendingInitLoading && !isTrendingFetchingMore && !trendingHasMore && trendingFeed.length > 0 && (
            <div className="flex items-center justify-center py-6"><div className="flex items-center gap-2 text-text/30"><div className="h-px w-16 bg-border" /><span className="text-xs font-medium">You are all caught up</span><div className="h-px w-16 bg-border" /></div></div>
          )}
        </div>

        <aside className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 shrink-0 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto hover-scrollbar">
          {isAuthenticated && (
            <TrendingDiscussionsWidget discussions={trendingSidebarItems} isLoading={isSidebarLoading} />
          )}
          <PopularResourcesWidget />
        </aside>
      </div>

      <OnboardingModal open={showOnboarding} onComplete={() => setShowOnboarding(false)} />
    </div>
  );
}

export default HomePage;
