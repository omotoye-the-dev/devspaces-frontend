import { useState, useEffect, useRef, type JSX } from "react";
import { HiOutlineFire, HiOutlineUserGroup } from "react-icons/hi2";
import {
  HeroBanner,
  FeedTabs,
  TrendingDiscussionsWidget,
  PopularResourcesWidget,
} from "@/features/articles/components";
import { isProfileComplete } from "@/features/profile/api/user.api";
import { OnboardingModal } from "@/features/onboarding/components/OnboardingModal";
import { useAuthStore } from "@/store";

import { LoginPrompt } from "@/features/auth/components/LoginPrompt";
import { HomeArticleCard } from "@/features/home/components/HomeArticleCard";
import { TrendingPostCard } from "@/features/home/components/TrendingPostCard";
import { TrendingDiscussionCard } from "@/features/home/components/TrendingDiscussionCard";
import { TrendingResourceCard } from "@/features/home/components/TrendingResourceCard";
import { FeedSkeleton } from "@/features/home/components/FeedSkeleton";
import { TRENDING_FILTERS } from "@/features/home/constants";

import { useHomeFeed } from "@/features/home/hooks/useHomeFeed";
import { useTrendingFeed } from "@/features/home/hooks/useTrendingFeed";
import { useSidebarTrending } from "@/features/home/hooks/useSidebarTrending";
import { invalidateProfiles, useMyProfile } from "@/features/profile/api/profileQueries";

export function HomePage(): JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // Regular feed
  const [activeTab, setActiveTab] = useState<string>("For You");
  const {
    articles,
    isLoading,
    isFetchingMore,
    hasMore,
    setHasMore,
    nextPageRef,
    fetchArticles,
    handleLike,
    handleSave,
  } = useHomeFeed();
  const activeTabRef = useRef<string>("For You");
  const sentinelRef = useRef<HTMLDivElement>(null);
  // The Following feed and Trending (posts + discussions) endpoints require a session
  const isGuestGated = !isAuthenticated && (activeTab === "Following" || activeTab === "Trending");

  const {
    trendingFilter,
    setTrendingFilter,
    isTrendingInitLoading,
    isTrendingFetchingMore,
    fetchTrendingInitial,
    loadMoreTrending,
    handleTrendingLikePost,
    handleTrendingSavePost,
    handleTrendingLikeDiscussion,
    trendingFeed,
    trendingHasMore,
  } = useTrendingFeed();

  const { trendingSidebarItems, isSidebarLoading } = useSidebarTrending(isAuthenticated);
  const { data: myProfile } = useMyProfile(isAuthenticated);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const showOnboarding =
    isAuthenticated && Boolean(myProfile) && !isProfileComplete(myProfile) && !onboardingDone;

  // Tab switch
  useEffect(() => {
    activeTabRef.current = activeTab;
    if (isGuestGated) return;
    if (activeTab === "Trending") {
      queueMicrotask(() => {
        void fetchTrendingInitial();
      });
    } else {
      nextPageRef.current = 1;
      queueMicrotask(() => {
        setHasMore(true);
        void fetchArticles(activeTab, 1, true);
      });
    }
  }, [activeTab, isGuestGated, fetchArticles, fetchTrendingInitial, nextPageRef, setHasMore]);

  // Infinite scroll — regular feed
  useEffect(() => {
    if (activeTab === "Trending" || isGuestGated) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          void fetchArticles(activeTabRef.current, nextPageRef.current, false);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeTab, isGuestGated, hasMore, isFetchingMore, isLoading, fetchArticles, nextPageRef]);

  // Infinite scroll — trending feed
  useEffect(() => {
    if (activeTab !== "Trending" || isGuestGated) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isTrendingInitLoading && !isTrendingFetchingMore) {
          void loadMoreTrending();
        }
      },
      { rootMargin: "250px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeTab, isGuestGated, isTrendingInitLoading, isTrendingFetchingMore, loadMoreTrending]);

  return (
    <div className="w-full max-w-300 mx-auto font-inter">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          <HeroBanner />
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "Trending" && isAuthenticated && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {TRENDING_FILTERS.map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTrendingFilter(label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer border ${trendingFilter === label ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-text/60 border-border hover:border-primary/40 hover:text-text"}`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4 min-h-75">
            {isGuestGated ? (
              <LoginPrompt
                icon={
                  activeTab === "Following" ? (
                    <HiOutlineUserGroup className="w-6 h-6" />
                  ) : (
                    <HiOutlineFire className="w-6 h-6" />
                  )
                }
                title={
                  activeTab === "Following"
                    ? "Log in to see posts from people you follow"
                    : "Log in to see what's trending"
                }
                description={
                  activeTab === "Following"
                    ? "Follow developers and their latest articles will show up here."
                    : "Trending posts, discussions and resources from across DevSpace."
                }
              />
            ) : activeTab === "Trending" ? (
              isTrendingInitLoading ? (
                <FeedSkeleton />
              ) : trendingFeed.length === 0 ? (
                <div className="bg-white border border-border rounded-lg p-10 text-center space-y-2">
                  <HiOutlineFire className="w-7 h-7 text-text/20 mx-auto mb-1" />
                  <p className="text-base font-semibold text-text">Nothing trending yet</p>
                  <p className="text-xs text-text/50">Check back soon for hot content.</p>
                </div>
              ) : (
                trendingFeed.map((item) => {
                  if (item.kind === "post")
                    return (
                      <TrendingPostCard
                        key={`post-${item.id}`}
                        item={item}
                        onLike={() => handleTrendingLikePost(item.id)}
                        onSave={() => handleTrendingSavePost(item.id)}
                      />
                    );
                  if (item.kind === "discussion")
                    return (
                      <TrendingDiscussionCard
                        key={`disc-${item.id}`}
                        item={item}
                        onLike={() => handleTrendingLikeDiscussion(item.id)}
                      />
                    );
                  return <TrendingResourceCard key={`res-${item.id}`} item={item} />;
                })
              )
            ) : isLoading ? (
              <FeedSkeleton />
            ) : articles.length === 0 ? (
              <div className="bg-white border border-border rounded-lg p-10 text-center space-y-2">
                <p className="text-base font-semibold text-text">
                  No articles found in {activeTab}
                </p>
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
                    cx="12"
                    cy="12"
                    r="10"
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

          {activeTab !== "Trending" &&
            !isLoading &&
            !isFetchingMore &&
            !hasMore &&
            articles.length > 0 && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-2 text-text/30">
                  <div className="h-px w-16 bg-border" />
                  <span className="text-xs font-medium">You are all caught up</span>
                  <div className="h-px w-16 bg-border" />
                </div>
              </div>
            )}
          {activeTab === "Trending" &&
            !isTrendingInitLoading &&
            !isTrendingFetchingMore &&
            !trendingHasMore &&
            trendingFeed.length > 0 && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-2 text-text/30">
                  <div className="h-px w-16 bg-border" />
                  <span className="text-xs font-medium">You are all caught up</span>
                  <div className="h-px w-16 bg-border" />
                </div>
              </div>
            )}
        </div>

        <aside className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 shrink-0 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto hover-scrollbar">
          {isAuthenticated && (
            <TrendingDiscussionsWidget
              discussions={trendingSidebarItems}
              isLoading={isSidebarLoading}
            />
          )}
          <PopularResourcesWidget />
        </aside>
      </div>

      <OnboardingModal
        open={showOnboarding}
        onComplete={() => {
          setOnboardingDone(true);
          void invalidateProfiles();
        }}
      />
    </div>
  );
}

export default HomePage;
