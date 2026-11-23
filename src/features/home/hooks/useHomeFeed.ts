import { useCallback, useRef, useState } from "react";
import {
  getFeedArticles,
  getFollowingArticles,
  getPersonalizedArticles,
  likeArticle,
  saveArticle,
  type Article,
  type Pagination,
} from "@/features/articles/api/articleApi";
import { useAuthStore } from "@/store";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";
import { mapApiArticleToFeedItem } from "@/features/home/utils/feedMappers";
import { PAGE_SIZE } from "@/features/home/constants";
import type { ArticleFeedItem } from "@/features/home/types";

/** Paged article feed for the For You / Following / Latest tabs, with like and save. */
export function useHomeFeed() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const requireAuth = useRequireAuth();
  const [articles, setArticles] = useState<ArticleFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const nextPageRef = useRef<number>(1);

  const fetchArticles = useCallback(
    async (tab: string, page: number, isInitial: boolean): Promise<void> => {
      if (isInitial) setIsLoading(true);
      else setIsFetchingMore(true);
      try {
        let response: { data: Article[]; pagination?: Pagination };
        if (tab === "Following") {
          response = await getFollowingArticles({ page, pageSize: PAGE_SIZE });
        } else if (tab === "For You") {
          if (isAuthenticated) {
            try {
              response = await getPersonalizedArticles({ page, pageSize: PAGE_SIZE });
              if (isInitial && (!response.data || response.data.length === 0)) {
                response = await getFeedArticles({ page, pageSize: PAGE_SIZE });
              }
            } catch {
              response = await getFeedArticles({ page, pageSize: PAGE_SIZE });
            }
          } else {
            response = await getFeedArticles({ page, pageSize: PAGE_SIZE });
          }
        } else {
          response = await getFeedArticles({ page, pageSize: PAGE_SIZE });
        }
        const incoming = response.data?.map(mapApiArticleToFeedItem) ?? [];
        const paginationInfo = response.pagination;
        if (isInitial) {
          setArticles(incoming);
        } else {
          setArticles((prev) => [
            ...prev,
            ...incoming.filter((a) => !prev.some((p) => p.id === a.id)),
          ]);
        }
        const more = paginationInfo?.hasNext ?? incoming.length === PAGE_SIZE;
        setHasMore(more);
        if (more) nextPageRef.current = page + 1;
      } catch {
        if (isInitial) setArticles([]);
        setHasMore(false);
      } finally {
        if (isInitial) setIsLoading(false);
        else setIsFetchingMore(false);
      }
    },
    [isAuthenticated],
  );

  const handleLike = async (id: string): Promise<void> => {
    if (!requireAuth("like this article")) return;
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, liked: !a.liked, likes: a.liked ? a.likes - 1 : a.likes + 1 } : a,
      ),
    );
    try {
      await likeArticle(id);
    } catch {
      // errors
    }
  };

  const handleSave = async (id: string): Promise<void> => {
    if (!requireAuth("save this article")) return;
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, saved: !a.saved } : a)));
    try {
      await saveArticle(id);
    } catch {
      // errors
    }
  };

  return {
    articles,
    isLoading,
    isFetchingMore,
    hasMore,
    setHasMore,
    nextPageRef,
    fetchArticles,
    handleLike,
    handleSave,
  };
}
