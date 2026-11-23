import type { JSX } from "react";
import { LuPenLine } from "react-icons/lu";
import { Button, Skeleton } from "@/shared/ui";
import { ArticleCard } from "@/features/articles/components/ArticleCard";

import type { UseArticlesListResult } from "@/features/articles/hooks/useArticlesList";

/** Skeletons, empty state or the article grid/list with load-more. */
export function ArticlesFeed({ list }: { list: UseArticlesListResult }): JSX.Element {
  const {
    isLoading,
    isLoadingMore,
    loadMoreError,
    hasNextPage,
    searchQuery,
    setSearchQuery,
    bookmarkedIds,
    layout,
    navigate,
    sentinelRef,
    loadMore,
    toggleBookmark,
    handleLike,
    selectedCategory,
    setSelectedCategory,
    filteredArticles,
  } = list;

  return (
    <>
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
                  <Skeleton
                    variant="rounded"
                    width={176}
                    height={112}
                    className="hidden sm:block shrink-0"
                  />
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
      ) : (
        <>
          {layout === "list" ? (
            /* Feed list */
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  authorId={article.authorId}
                  title={article.title}
                  excerpt={article.excerpt}
                  tagNames={article.tagNames}
                  selectedTag={selectedCategory}
                  onTagClick={(tag) =>
                    setSelectedCategory((prev) =>
                      prev.toLowerCase() === tag.toLowerCase() ? "All" : tag,
                    )
                  }
                  coverImage={article.coverImage}
                  authorName={article.authoruserName}
                  authorAvatar={article.authorAvatar}
                  authorRole={article.authorRole}
                  createdAt={article.createdAt}
                  readTimeMinutes={article.readTimeMinutes}
                  likes={article.likes}
                  comments={article.comments}
                  isLiked={article.isLiked}
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
                  authorId={article.authorId}
                  title={article.title}
                  excerpt={article.excerpt}
                  tagNames={article.tagNames}
                  selectedTag={selectedCategory}
                  onTagClick={(tag) =>
                    setSelectedCategory((prev) =>
                      prev.toLowerCase() === tag.toLowerCase() ? "All" : tag,
                    )
                  }
                  coverImage={article.coverImage}
                  authorName={article.authoruserName}
                  authorAvatar={article.authorAvatar}
                  authorRole={article.authorRole}
                  createdAt={article.createdAt}
                  readTimeMinutes={article.readTimeMinutes}
                  likes={article.likes}
                  comments={article.comments}
                  isLiked={article.isLiked}
                  isBookmarked={bookmarkedIds.has(article.id)}
                  onBookmark={() => toggleBookmark(article.id)}
                  onLike={handleLike}
                  variant="vertical"
                />
              ))}
            </div>
          )}

          {/* Endless Scroll Sentinel & Indicators */}
          <div className="pt-4">
            <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />

            {isLoadingMore && (
              <div className="py-6 flex flex-col items-center justify-center space-y-2 text-text/70">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Loading more articles...</span>
                </div>
              </div>
            )}

            {loadMoreError && !isLoadingMore && (
              <div className="py-6 flex flex-col items-center justify-center space-y-2">
                <p className="text-xs text-rose-500">{loadMoreError}</p>
                <Button variant="outline" size="sm" onClick={() => void loadMore()}>
                  Retry Loading
                </Button>
              </div>
            )}

            {!hasNextPage && !isLoading && (
              <div className="py-8 flex items-center justify-center gap-3 text-xs text-text/50">
                <div className="h-px w-16 bg-border" />
                <span>You're all caught up!</span>
                <div className="h-px w-16 bg-border" />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
