import type { JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import articlePlaceholder from "@/assets/images/article-placeholder.jpg";
import { Button, Tag } from "@/shared/ui";
import ArticleComments from "@/features/articles/components/ArticleComments";
import { useArticleDetails } from "@/features/articles/hooks/useArticleDetails";
import RelatedArticles from "@/features/articles/components/RelatedArticles";
import AuthorCard from "@/features/articles/components/AuthorCard";
import { useReadingProgress } from "@/features/articles/hooks/useReadingProgress";
import { ArticleDetailsSkeleton } from "@/features/articles/components/article-details/ArticleDetailsSkeleton";
import { ReadingProgressBar } from "@/features/articles/components/article-details/ReadingProgressBar";
import { ArticleActionRail } from "@/features/articles/components/article-details/ArticleActionRail";
import { ArticleAuthorRow } from "@/features/articles/components/article-details/ArticleAuthorRow";
import { MobileActionBar } from "@/features/articles/components/article-details/MobileActionBar";

export type { DisplayArticle } from "@/features/articles/hooks/useArticleDetails";

export function ArticleDetailsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    article,
    isLoading,
    currentUser,
    isLiked,
    isLiking,
    likeCount,
    isBookmarked,
    isSaving,
    isFollowing,
    isFollowLoading,
    commentCount,
    setCommentCount,
    showComments,
    handleLike,
    handleBookmark,
    handleFollowToggle,
    handleShare,
    handleEdit,
    handleDelete,
    handleCommentsToggle,
  } = useArticleDetails(id);

  const { pageRef, articleRef, readingProgress } = useReadingProgress(article?.content);

  if (isLoading) {
    return <ArticleDetailsSkeleton />;
  }

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Article not found</h1>

          <p className="mb-5 text-sm text-gray-500">
            The article you're looking for doesn't exist.
          </p>

          <Button onClick={() => navigate("/articles")} variant="primary">
            Back to Articles
          </Button>
        </div>
      </div>
    );
  }

  const targetAuthorId = article.author?.id || article.authorId;

  const isAuthor = Boolean(currentUser?.id && targetAuthorId && currentUser.id === targetAuthorId);

  /**
   * Resolve the author's display name directly from the embedded author object.
   */
  const resolvedAuthorName =
    article.author?.name || article.author?.userName || article.authorName || "DevSpace Author";

  /**
   * Resolve the avatar directly from the embedded author object.
   */
  const resolvedAuthorAvatar = article.author?.avatarUrl ?? article.authorAvatar;

  const resolvedAuthorUsername = (
    article.author?.userName ??
    article.author?.username ??
    article.authorUserName ??
    "DevSpace Author"
  )
    .toString()
    .trim()
    .replace(/^@/, "");

  const authorProfileUrl = targetAuthorId ? `/profile/${targetAuthorId}` : "/profile";

  const formattedDate = new Date(article.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const readingTime =
    article.readingTimeMinutes ??
    article.readingTime ??
    Math.max(1, Math.ceil((article.content?.length ?? 0) / 200));

  const coverImage = article.coverImage ?? article.coverImageUrl ?? articlePlaceholder;

  return (
    <div ref={pageRef} className="min-h-screen w-full bg-gray-50">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* In-page Sticky Reading Progress Bar */}
        <ReadingProgressBar readingProgress={readingProgress} />

        <div className="flex w-full justify-between gap-8 lg:gap-12">
          {/* Left action bar */}
          <ArticleActionRail
            isLiked={isLiked}
            likeCount={likeCount}
            isLiking={isLiking}
            onLike={handleLike}
            showComments={showComments}
            commentCount={commentCount}
            onToggleComments={handleCommentsToggle}
            isBookmarked={isBookmarked}
            isSaving={isSaving}
            onBookmark={handleBookmark}
            onShare={handleShare}
            isAuthor={isAuthor}
            onEdit={handleEdit}
            onDelete={() => void handleDelete()}
          />

          {/* Main content */}
          <main className="min-w-0 flex-1">
            {/* Article header */}
            <header className="space-y-5">
              <h1 className="wrap-break-word text-4xl font-black leading-tight tracking-tight text-gray-900 sm:text-5xl">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="max-w-2xl wrap-break-word text-base leading-7 text-gray-600">
                  {article.excerpt}
                </p>
              )}

              {/* Tags */}
              {article.tagNames && article.tagNames.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tagNames.map((tag) => (
                    <Tag key={tag} variant="outline" size="sm">
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </header>

            {/* Author */}
            <ArticleAuthorRow
              resolvedAuthorAvatar={resolvedAuthorAvatar}
              resolvedAuthorName={resolvedAuthorName}
              resolvedAuthorUsername={resolvedAuthorUsername}
              authorProfileUrl={authorProfileUrl}
              formattedDate={formattedDate}
              readingTime={readingTime}
              isAuthor={isAuthor}
              targetAuthorId={targetAuthorId}
              isFollowing={isFollowing}
              isFollowLoading={isFollowLoading}
              onFollowToggle={handleFollowToggle}
            />

            {/* Cover image */}
            {coverImage && (
              <div className="mb-8 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <img
                  src={coverImage}
                  alt={article.title}
                  className="h-auto max-h-125 w-full object-cover"
                />
              </div>
            )}

            {/* Article content */}
            <article
              ref={articleRef}
              className="w-full max-w-none wrap-break-word prose prose-sm sm:prose-base prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight prose-headings:break-words prose-headings:mt-8 prose-headings:mb-4 prose-p:text-gray-700 prose-p:leading-7 prose-p:break-words prose-a:text-primary prose-a:no-underline prose-a:break-words hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-primary prose-blockquote:text-gray-600 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-gray-800 prose-code:break-words prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-gray-900 prose-pre:p-5 prose-li:text-gray-700 prose-li:break-words prose-img:max-w-full prose-img:h-auto prose-img:rounded-xl prose-img:shadow-sm"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
            </article>

            {/* Mobile actions */}
            <MobileActionBar
              isLiked={isLiked}
              likeCount={likeCount}
              isLiking={isLiking}
              onLike={handleLike}
              showComments={showComments}
              commentCount={commentCount}
              onToggleComments={handleCommentsToggle}
              isBookmarked={isBookmarked}
              isSaving={isSaving}
              onBookmark={handleBookmark}
              onShare={handleShare}
            />

            {/* Mobile comments */}
            {showComments && (
              <div id="comments-section" className="mt-8 border-t border-gray-200 pt-8 lg:hidden">
                <ArticleComments
                  articleId={article.id}
                  initialCommentCount={commentCount}
                  onCommentCountChange={setCommentCount}
                />
              </div>
            )}
          </main>

          {/* Right sidebar */}
          <aside className="hidden lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:gap-8 xl:w-96">
            <div className="sticky top-8 flex flex-col gap-8">
              {/* Author Card */}
              <AuthorCard
                author={article.author}
                authorId={targetAuthorId}
                authorName={resolvedAuthorName}
                authorAvatar={resolvedAuthorAvatar}
                isAuthor={isAuthor}
                followersCount={article.author?.totalFollowers}
                followingCount={article.author?.totalFollowed}
                articlesCount={
                  article.author?.articlesCount ??
                  article.author?.totalArticles ??
                  article.author?.totalPosts
                }
              />

              {/* Related articles */}
              <RelatedArticles currentArticleId={article.id} />

              {/* Desktop comments */}
              {showComments && (
                <div id="comments-section" className="border-t border-gray-200 pt-8">
                  <ArticleComments
                    articleId={article.id}
                    initialCommentCount={commentCount}
                    onCommentCountChange={setCommentCount}
                  />
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ArticleDetailsPage;
