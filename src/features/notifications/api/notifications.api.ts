import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  NotificationItem,
  NotificationListResult,
  NotificationPagination,
} from "@/types/notifications.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * GET /api/notifications
 *
 * The list is wrapped twice by the backend ({ data: { data: [...], pagination } }),
 * so accept that shape as well as a single-level wrapper or a bare array.
 */
export async function getNotifications(params?: {
  page?: number;
  pageSize?: number;
}): Promise<NotificationListResult> {
  const response = await apiClient.get<unknown>(ENDPOINTS.NOTIFICATIONS.LIST, { params });
  const body = response.data;

  if (Array.isArray(body)) return { items: body as NotificationItem[] };
  if (!isRecord(body)) return { items: [] };

  const level1 = body.data;
  if (Array.isArray(level1)) {
    return {
      items: level1 as NotificationItem[],
      pagination: body.pagination as NotificationPagination | undefined,
    };
  }

  if (isRecord(level1)) {
    return {
      items: Array.isArray(level1.data) ? (level1.data as NotificationItem[]) : [],
      pagination: (level1.pagination ?? body.pagination) as NotificationPagination | undefined,
    };
  }

  return { items: [] };
}

/**
 * GET /api/notifications/unread-count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const response = await apiClient.get<{ data?: { unreadCount?: number } }>(
    ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
  );
  return response.data?.data?.unreadCount ?? 0;
}

/**
 * PATCH /api/notifications/{id}/read
 */
export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(ENDPOINTS.NOTIFICATIONS.READ(id), {});
}

/**
 * PATCH /api/notifications/read-all
 */
export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch(ENDPOINTS.NOTIFICATIONS.READ_ALL, {});
}

/**
 * DELETE /api/notifications/{id}
 */
export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.NOTIFICATIONS.DETAIL(id));
}
