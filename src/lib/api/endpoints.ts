export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ENDPOINTS = {
  AUTH: {
    SIGN_UP: `${API_BASE_URL}/api/Auth/signup`,
    SIGN_IN: `${API_BASE_URL}/api/Auth/signin`,
    GOOGLE_INIT: `${API_BASE_URL}/api/Auth/google`,
    GITHUB_INIT: `${API_BASE_URL}/api/Auth/github`,
    GOOGLE_CALLBACK: `${API_BASE_URL}/api/Auth/google/callback`,
    GITHUB_CALLBACK: `${API_BASE_URL}/api/Auth/github/callback`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/Auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/Auth/reset-password`,
    VERIFY_ACCOUNT: `${API_BASE_URL}/api/Auth/verify-email`,
    RESEND_OTP: `${API_BASE_URL}/api/Auth/resend-otp`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/Auth/refresh-token`,
    LOGOUT: `${API_BASE_URL}/api/Auth/logout`,
  },

  USER: {
    PROFILE: `${API_BASE_URL}/api/v1/users/profile`,
    LIST: `${API_BASE_URL}/api/v1/users/list`,
    ALL: `${API_BASE_URL}/api/v1/users/all`,
    INTERESTED_TAGS: `${API_BASE_URL}/api/v1/users/me/interested-tags`,
    ACTIVITY: (userId: string) => `${API_BASE_URL}/api/v1/users/${userId}/activity`,
    ABOUT: (username: string) => `${API_BASE_URL}/api/v1/users/${username}/about`,
  },
  LEADERBOARD: `${API_BASE_URL}/api/v1/leaderboard`,
  AUTHORS: {
    LIST: `${API_BASE_URL}/api/authors`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/authors/${id}`,
    FOLLOW: (id: string) => `${API_BASE_URL}/api/authors/${id}/follow`,
  },
  USERS: {
    LIST: `${API_BASE_URL}/api/users`,
    ALL: `${API_BASE_URL}/api/users/all`,
  },

  POSTS: {
    FEED: `${API_BASE_URL}/api/posts/feed`,
    MY_POSTS: `${API_BASE_URL}/api/posts/my-posts`,

    CREATE: `${API_BASE_URL}/api/posts`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/posts/${id}`,
    LIKE: (id: string) => `${API_BASE_URL}/api/posts/${id}/like`,
    COMMENTS: (id: string) => `${API_BASE_URL}/api/posts/${id}/comments`,

    CREATE_COMMENT: (id: string) => `${API_BASE_URL}/api/posts/${id}/comment`,
    LIKE_COMMENT: (commentId: string) => `${API_BASE_URL}/api/posts/comments/${commentId}/like`,

    SAVE: (id: string) => `${API_BASE_URL}/api/posts/${id}/save`,
    SAVED: `${API_BASE_URL}/api/posts/saved`,
    HISTORY: `${API_BASE_URL}/api/posts/history`,
    COVER_IMAGE: (id: string) => `${API_BASE_URL}/api/posts/${id}/cover-image`,
    TRENDING: `${API_BASE_URL}/api/posts/trending`,
    FOLLOWING: `${API_BASE_URL}/api/posts/feed/following`,
  },
  TAGS: {
    LIST: `${API_BASE_URL}/api/tags`,
  },
  RESOURCES: {
    BASE: `${API_BASE_URL}/api/resources`,
    SAVED: `${API_BASE_URL}/api/resources/saved`,
    HISTORY: `${API_BASE_URL}/api/resources/history`,
    UPLOAD_IMAGE: `${API_BASE_URL}/api/resources/upload-image`,
    UPLOAD_FILE: `${API_BASE_URL}/api/resources/upload-file`,
    CATEGORIES: `${API_BASE_URL}/api/resources/categories`,
    PREVIEW_LINK: `${API_BASE_URL}/api/resources/preview-link`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/resources/${id}`,
    PARTS: (id: string) => `${API_BASE_URL}/api/resources/${id}/parts`,
    PART_DETAIL: (id: string, partId: string) =>
      `${API_BASE_URL}/api/resources/${id}/parts/${partId}`,
    REORDER_PARTS: (id: string) => `${API_BASE_URL}/api/resources/${id}/parts/reorder`,
    VOTE: (id: string, action?: number) =>
      action !== undefined
        ? `${API_BASE_URL}/api/resources/${id}/vote?action=${action}`
        : `${API_BASE_URL}/api/resources/${id}/vote`,
    VOTE_BASE: (id: string) => `${API_BASE_URL}/api/resources/${id}/vote`,
    SAVE: (id: string, saved: boolean) => `${API_BASE_URL}/api/resources/${id}/save?saved=${saved}`,
    DOWNLOAD: (id: string, partId?: string) =>
      partId
        ? `${API_BASE_URL}/api/resources/${id}/download?partId=${encodeURIComponent(partId)}`
        : `${API_BASE_URL}/api/resources/${id}/download`,
  },
  DISCUSSIONS: {
    BASE: `${API_BASE_URL}/api/discussions`,
    SAVED: `${API_BASE_URL}/api/discussions/saved`,
    HISTORY: `${API_BASE_URL}/api/discussions/history`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/discussions/${id}`,
    REPLIES: (id: string) => `${API_BASE_URL}/api/discussions/${id}/replies`,
    REPLY_DETAIL: (id: string, replyId: string) =>
      `${API_BASE_URL}/api/discussions/${id}/replies/${replyId}`,
    REPLY_VOTE: (id: string, replyId: string, action: number) =>
      `${API_BASE_URL}/api/discussions/${id}/replies/${replyId}/vote?action=${action}`,
    SAVE: (id: string) => `${API_BASE_URL}/api/discussions/${id}/save`,
    LIKE: (id: string) => `${API_BASE_URL}/api/discussions/${id}/like`,
  },
} as const;
