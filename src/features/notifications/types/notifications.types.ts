export interface NotificationActor {
  /** REST responses use `id`; the live hub payload uses `userId`. */
  id?: string;
  userId?: string;
  username: string;
  fullName?: string;
  avatarUrl?: string | null;
}

export interface NotificationItem {
  id: string;
  recipientId?: string;
  actor?: NotificationActor | null;
  type: string;
  title: string;
  message: string;
  targetType?: string;
  targetId?: string;
  targetSlug?: string | null;
  /** Relative app path, e.g. "/resources/{id}" (present on live hub pushes). */
  targetUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface NotificationListResult {
  items: NotificationItem[];
  pagination?: NotificationPagination;
}
