import type { JSX } from "react";

import { useArticlesList } from "@/features/articles/hooks/useArticlesList";
import { ArticlesHeader } from "@/features/articles/components/articles-list/ArticlesHeader";
import { ArticlesFilterBar } from "@/features/articles/components/articles-list/ArticlesFilterBar";
import { ArticlesFeed } from "@/features/articles/components/articles-list/ArticlesFeed";
import { ScrollToTopButton } from "@/features/articles/components/articles-list/ScrollToTopButton";

export function ArticlesPage(): JSX.Element {
  const list = useArticlesList();
  const { topRef } = list;

  return (
    <div ref={topRef} className="max-w-4xl mx-auto space-y-6 font-inter">
      {/* Header */}
      <ArticlesHeader list={list} />

      {/* Filter & Search Bar */}
      <ArticlesFilterBar list={list} />

      {/* Loading skeletons */}
      <ArticlesFeed list={list} />

      {/* Floating scroll-to-top */}
      <ScrollToTopButton list={list} />
    </div>
  );
}

export default ArticlesPage;
