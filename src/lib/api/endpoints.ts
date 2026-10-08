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
    PROFILE: `${API_BASE_URL}/api/User/profile`,
  },
  AUTHORS: {
    DETAIL: (id: string) => `${API_BASE_URL}/api/authors/${id}`,
    FOLLOW: (id: string) => `${API_BASE_URL}/api/authors/${id}/follow`,
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
    COVER_IMAGE: (id: string) => `${API_BASE_URL}/api/posts/${id}/cover-image`,
    TRENDING: `${API_BASE_URL}/api/posts/trending`,
  },
  TAGS: {
    LIST: `${API_BASE_URL}/api/tags`,
  },
  RESOURCES: {
    BASE: `${API_BASE_URL}/api/resources`,
    UPLOAD_IMAGE: `${API_BASE_URL}/api/resources/upload-image`,
    UPLOAD_FILE: `${API_BASE_URL}/api/resources/upload-file`,
    CATEGORIES: `${API_BASE_URL}/api/resources/categories`,
    PREVIEW_LINK: `${API_BASE_URL}/api/resources/preview-link`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/resources/${id}`,
    PARTS: (id: string) => `${API_BASE_URL}/api/resources/${id}/parts`,
    PART_DETAIL: (id: string, partId: string) =>
      `${API_BASE_URL}/api/resources/${id}/parts/${partId}`,
    REORDER_PARTS: (id: string) => `${API_BASE_URL}/api/resources/${id}/parts/reorder`,
    VOTE: (id: string, value: number) => `${API_BASE_URL}/api/resources/${id}/vote?value=${value}`,
    VOTE_BASE: (id: string) => `${API_BASE_URL}/api/resources/${id}/vote`,
    UPVOTE: (id: string) => `${API_BASE_URL}/api/resources/${id}/upvote`,
    DOWNVOTE: (id: string) => `${API_BASE_URL}/api/resources/${id}/downvote`,
    SAVE: (id: string, saved: boolean) => `${API_BASE_URL}/api/resources/${id}/save?saved=${saved}`,
    DOWNLOAD: (id: string, partId?: string) =>
      partId
        ? `${API_BASE_URL}/api/resources/${id}/download?partId=${encodeURIComponent(partId)}`
        : `${API_BASE_URL}/api/resources/${id}/download`,
  },
} as const;
