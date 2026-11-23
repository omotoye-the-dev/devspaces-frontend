import type { JSX } from "react";
import { Button, EmptyState, Skeleton } from "@/shared/ui";
import type { Article } from "@/features/articles/api/articleApi";
import { ArticleCard } from "@/features/articles/components/ArticleCard";
import { FiFileText } from "react-icons/fi";

interface ProfileArticlesTabProps {
  isLoading: boolean;
  articles: Article[];
  displayName: string;
  avatarUrl?: string;
  authorRole?: string;
  isOwnProfile: boolean;
}

export function ProfileArticlesTab({
  isLoading,
  articles,
  displayName,
  avatarUrl,
  authorRole,
  isOwnProfile,
}: ProfileArticlesTabProps): JSX.Element {
  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art) => (
            <ArticleCard
              key={art.id}
              id={art.id}
              authorId={art.author?.id || art.authorId}
              title={art.title}
              excerpt={art.excerpt || art.content.slice(0, 110) + "..."}
              tagNames={art.tags || art.tagNames || []}
              coverImage={art.coverImageUrl || art.coverImage}
              authorName={art.author?.name || art.author?.userName || art.authorName || displayName}
              authorAvatar={art.author?.avatarUrl || avatarUrl}
              authorRole={authorRole}
              createdAt={art.createdAt}
              readTimeMinutes={art.readingTimeMinutes ?? art.readingTime ?? 4}
              likes={art.likeCount ?? art.likes ?? 0}
              comments={art.commentCount ?? art.comments ?? 0}
              isLiked={Boolean(art.liked ?? art.isLiked)}
              isEditable={isOwnProfile}
              status={isOwnProfile ? art.status : undefined}
              targetHref={isOwnProfile ? `/articles/${art.id}/edit` : `/articles/${art.id}`}
              variant="vertical"
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FiFileText className="w-10 h-10 text-text/30" />}
          title="No articles published yet"
          description={
            isOwnProfile
              ? "You haven't written any articles yet."
              : `${displayName} hasn't written any articles yet.`
          }
          bordered
          action={
            <Button href="/articles/new" size="sm" className="rounded-xl">
              Write an Article
            </Button>
          }
        />
      )}
    </div>
  );
}
