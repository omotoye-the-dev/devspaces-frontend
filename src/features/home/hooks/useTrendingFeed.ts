import { useCallback, useRef, useState } from "react";
import { getTrendingArticles, likeArticle, saveArticle } from "@/features/articles/api/articleApi";
import { getDiscussions, likeDiscussion } from "@/features/discussions/api/discussionApi";
import { getResources } from "@/features/resources/api/resources.api";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";
import {
  mapTrendingDiscussion,
  mapTrendingPost,
  mapTrendingResource,
} from "@/features/home/utils/feedMappers";
import { PAGE_SIZE } from "@/features/home/constants";
import type {
  TrendingDiscussionItem,
  TrendingFeedItem,
  TrendingFilter,
  TrendingPostItem,
  TrendingResourceItem,
} from "@/features/home/types";

/** Trending tab: posts, discussions and resources, paged independently and interleaved for "All". */
export function useTrendingFeed() {
  const requireAuth = useRequireAuth();
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

  const fetchTrendingInitial = useCallback(async () => {
    setIsTrendingInitLoading(true);
    trendingPostsPageRef.current = 1;
    trendingDiscPageRef.current = 1;
    trendingResPageRef.current = 1;
    updateHasMore("posts", true);
    updateHasMore("disc", true);
    updateHasMore("res", true);
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
    } else {
      setTrendingPosts([]);
      updateHasMore("posts", false);
    }
    if (discRes.status === "fulfilled") {
      const data = discRes.value;
      setTrendingDiscussions(data.map(mapTrendingDiscussion));
      updateHasMore("disc", data.length >= PAGE_SIZE);
      if (hasMoreTrendingRef.current.disc) trendingDiscPageRef.current = 2;
    } else {
      setTrendingDiscussions([]);
      updateHasMore("disc", false);
    }
    if (resRes.status === "fulfilled") {
      const data = resRes.value.data ?? [];
      setTrendingResources(data.map(mapTrendingResource));
      updateHasMore("res", resRes.value.pagination?.hasNext ?? data.length >= PAGE_SIZE);
      if (hasMoreTrendingRef.current.res) trendingResPageRef.current = 2;
    } else {
      setTrendingResources([]);
      updateHasMore("res", false);
    }
    setIsTrendingInitLoading(false);
  }, [updateHasMore]);

  const loadMoreTrending = useCallback(async () => {
    if (isTrendingFetchingMore || isTrendingInitLoading) return;
    const needPosts =
      (trendingFilter === "All" || trendingFilter === "Posts") && hasMoreTrendingRef.current.posts;
    const needDisc =
      (trendingFilter === "All" || trendingFilter === "Discussions") &&
      hasMoreTrendingRef.current.disc;
    const needRes =
      (trendingFilter === "All" || trendingFilter === "Resources") &&
      hasMoreTrendingRef.current.res;
    if (!needPosts && !needDisc && !needRes) return;
    setIsTrendingFetchingMore(true);
    const promises: Promise<void>[] = [];
    if (needPosts) {
      const page = trendingPostsPageRef.current;
      promises.push(
        getTrendingArticles({ page, pageSize: PAGE_SIZE })
          .then((res) => {
            const data = res.data ?? [];
            setTrendingPosts((prev) => [
              ...prev,
              ...data.map(mapTrendingPost).filter((p) => !prev.some((x) => x.id === p.id)),
            ]);
            updateHasMore("posts", res.pagination?.hasNext ?? data.length >= PAGE_SIZE);
            if (hasMoreTrendingRef.current.posts) trendingPostsPageRef.current = page + 1;
          })
          .catch(() => {
            updateHasMore("posts", false);
          }),
      );
    }
    if (needDisc) {
      const page = trendingDiscPageRef.current;
      promises.push(
        getDiscussions({ sort: "trending", page, pageSize: PAGE_SIZE })
          .then((data) => {
            setTrendingDiscussions((prev) => [
              ...prev,
              ...data.map(mapTrendingDiscussion).filter((d) => !prev.some((x) => x.id === d.id)),
            ]);
            updateHasMore("disc", data.length >= PAGE_SIZE);
            if (hasMoreTrendingRef.current.disc) trendingDiscPageRef.current = page + 1;
          })
          .catch(() => {
            updateHasMore("disc", false);
          }),
      );
    }
    if (needRes) {
      const page = trendingResPageRef.current;
      promises.push(
        getResources({ page, pageSize: PAGE_SIZE } as Parameters<typeof getResources>[0])
          .then((res) => {
            const data = res.data ?? [];
            setTrendingResources((prev) => [
              ...prev,
              ...data.map(mapTrendingResource).filter((r) => !prev.some((x) => x.id === r.id)),
            ]);
            updateHasMore("res", res.pagination?.hasNext ?? data.length >= PAGE_SIZE);
            if (hasMoreTrendingRef.current.res) trendingResPageRef.current = page + 1;
          })
          .catch(() => {
            updateHasMore("res", false);
          }),
      );
    }
    await Promise.allSettled(promises);
    setIsTrendingFetchingMore(false);
  }, [trendingFilter, isTrendingFetchingMore, isTrendingInitLoading, updateHasMore]);

  const handleTrendingLikePost = async (id: string): Promise<void> => {
    if (!requireAuth("like this article")) return;
    setTrendingPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p,
      ),
    );
    try {
      await likeArticle(id);
    } catch {
      /* silent */
    }
  };
  const handleTrendingSavePost = async (id: string): Promise<void> => {
    if (!requireAuth("save this article")) return;
    setTrendingPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
    try {
      await saveArticle(id);
    } catch {
      /* silent */
    }
  };
  const handleTrendingLikeDiscussion = async (id: string): Promise<void> => {
    if (!requireAuth("like this discussion")) return;
    setTrendingDiscussions((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, liked: !d.liked, upvotes: d.liked ? d.upvotes - 1 : d.upvotes + 1 }
          : d,
      ),
    );
    try {
      await likeDiscussion(id);
    } catch {
      /* silent */
    }
  };

  // Derived trending feed
  const trendingFeed: TrendingFeedItem[] = (() => {
    if (trendingFilter === "Posts") return trendingPosts;
    if (trendingFilter === "Discussions") return trendingDiscussions;
    if (trendingFilter === "Resources") return trendingResources;
    const maxLen = Math.max(
      trendingPosts.length,
      trendingDiscussions.length,
      trendingResources.length,
    );
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

  return {
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
  };
}
