export interface DiscussionAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  role?: string;
}

export interface DiscussionComment {
  id: string;
  discussionId: string;
  author: DiscussionAuthor;
  content: string;
  createdAt: string;
  upvotes: number;
  isUpvoted?: boolean;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  author: DiscussionAuthor;
  tags: string[];
  createdAt: string;
  upvotes: number;
  downvotes: number;
  likeCount?: number;
  saveCount?: number;
  isLiked?: boolean;
  userVote?: "up" | "down" | null;
  commentsCount: number;
  comments: DiscussionComment[];
  isSolved?: boolean;
  isBookmarked?: boolean;
}

export type DiscussionSortOption = "trending" | "latest" | "most_answered";

export interface CreateDiscussionDto {
  title: string;
  content: string;
  tags: string[];
}

export interface CreateCommentDto {
  content: string;
}
