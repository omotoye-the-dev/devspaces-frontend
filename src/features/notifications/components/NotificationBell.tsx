import { useEffect, useRef, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineBell } from "react-icons/hi";
import { HiOutlineTrash } from "react-icons/hi2";
import { Avatar, Button, Skeleton } from "@/components/common";
import { toast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { formatTimeAgo } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/api/notifications.api";
import { createNotificationHubConnection } from "@/lib/signalr/signalr";
import type { NotificationItem } from "@/types/notifications.types";

const PAGE_SIZE = 10;
const UNREAD_POLL_MS = 60_000;

function getNotificationPath(n: NotificationItem): string | null {
  if (n.targetUrl?.startsWith("/")) return n.targetUrl;

  if (n.targetId) {
    switch (n.targetType?.toLowerCase()) {
      case "post":
      case "article":
        return `/articles/${n.targetSlug || n.targetId}`;
      case "resource":
        return `/resources/${n.targetId}`;
      case "discussion":
        return `/discussions/${n.targetId}`;
      case "user":
      case "profile":
        return `/profile/${n.targetId}`;
    }
  }

  const actorId = n.actor?.userId ?? n.actor?.id;
  return actorId ? `/profile/${actorId}` : null;
}

export interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps): JSX.Element {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the badge fresh: on mount, on an interval, and when the tab regains focus
  useEffect(() => {
    let isMounted = true;

    const refresh = (): void => {
      getUnreadNotificationCount()
        .then((count) => {
          if (isMounted) setUnreadCount(count);
        })
        .catch(() => {
          // Non-critical background refresh
        });
    };

    refresh();
    const timer = setInterval(refresh, UNREAD_POLL_MS);
    window.addEventListener("focus", refresh);
    return () => {
      isMounted = false;
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  // Real-time pushes: /ws/hub/notifications -> "ReceiveNotification"
  useEffect(() => {
    let isCancelled = false;
    const connection = createNotificationHubConnection();

    connection.on("ReceiveNotification", (incoming: NotificationItem) => {
      if (isCancelled || !incoming?.id) return;
      setItems((prev) =>
        prev.some((n) => n.id === incoming.id) ? prev : [incoming, ...prev],
      );
      if (!incoming.isRead) setUnreadCount((c) => c + 1);
    });

    connection.start().catch((err: unknown) => {
      if (!isCancelled) console.warn("[SignalR] Failed to connect to notifications hub:", err);
    });

    return () => {
      isCancelled = true;
      connection.off("ReceiveNotification");
      void connection.stop().catch(() => {
        // Ignore stop errors on unmount
      });
    };
  }, []);

  // Load the first page each time the panel opens
  useEffect(() => {
    if (!open) return;
    let isMounted = true;

    async function load(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        const [res, count] = await Promise.all([
          getNotifications({ page: 1, pageSize: PAGE_SIZE }),
          getUnreadNotificationCount().catch(() => null),
        ]);
        if (!isMounted) return;
        if (count !== null) setUnreadCount(count);
        setItems(res.items);
        setPage(1);
        setHasNext(Boolean(res.pagination?.hasNext));
      } catch (err: unknown) {
        if (isMounted) setError(getApiErrorMessage(err, "Failed to load notifications."));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleLoadMore = async (): Promise<void> => {
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getNotifications({ page: nextPage, pageSize: PAGE_SIZE });
      setItems((prev) => {
        const seen = new Set(prev.map((n) => n.id));
        return [...prev, ...res.items.filter((n) => !seen.has(n.id))];
      });
      setPage(nextPage);
      setHasNext(Boolean(res.pagination?.hasNext));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to load more notifications."));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleOpenNotification = async (n: NotificationItem): Promise<void> => {
    const path = getNotificationPath(n);

    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await markNotificationRead(n.id);
      } catch {
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: false } : x)));
        setUnreadCount((c) => c + 1);
      }
    }

    if (path) {
      setOpen(false);
      navigate(path);
    }
  };

  const handleMarkAllRead = async (): Promise<void> => {
    const previousItems = items;
    const previousCount = unreadCount;
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch (err: unknown) {
      setItems(previousItems);
      setUnreadCount(previousCount);
      toast.error(getApiErrorMessage(err, "Failed to mark notifications as read."));
    }
  };

  const handleDelete = async (n: NotificationItem): Promise<void> => {
    const previousItems = items;
    const previousCount = unreadCount;
    setItems((prev) => prev.filter((x) => x.id !== n.id));
    if (!n.isRead) setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await deleteNotification(n.id);
    } catch (err: unknown) {
      setItems(previousItems);
      setUnreadCount(previousCount);
      toast.error(getApiErrorMessage(err, "Failed to delete notification."));
    }
  };

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((state) => !state)}
        className="relative inline-flex items-center justify-center p-2 rounded-md text-text/80 hover:bg-slate-100 transition-colors shrink-0"
      >
        <HiOutlineBell className="w-6 h-6" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-4.5 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-blue-500 rounded-full">
            {badgeLabel}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2 z-50 w-[min(24rem,calc(100vw-2rem))] bg-white border border-border rounded-xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-bold text-text">Notifications</h2>
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              disabled={unreadCount === 0}
              className="text-xs font-semibold text-primary hover:underline disabled:text-text/30 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
            >
              Mark all as read
            </button>
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto hover-scrollbar">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="flex gap-3">
                    <Skeleton variant="circular" width={36} height={36} />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" width="70%" height={12} />
                      <Skeleton variant="text" width="100%" height={10} />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center space-y-3">
                <p className="text-xs text-rose-600 font-medium">{error}</p>
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <HiOutlineBell className="w-8 h-8 mx-auto text-text/20" />
                <p className="text-sm font-semibold text-text/70">You're all caught up</p>
                <p className="text-xs text-text/50">New notifications will show up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      "group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50",
                      !n.isRead && "bg-blue-50/50",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => void handleOpenNotification(n)}
                      className="flex flex-1 min-w-0 items-start gap-3 text-left cursor-pointer"
                    >
                      <Avatar
                        size="sm"
                        name={n.actor?.fullName ?? n.actor?.username ?? n.title}
                        src={n.actor?.avatarUrl ?? undefined}
                        alt={n.actor?.username ?? "Notification"}
                      />
                      <span className="min-w-0 flex-1 space-y-0.5">
                        <span className="block text-xs font-semibold text-text truncate">
                          {n.title}
                        </span>
                        <span className="block text-xs text-text/70 leading-snug line-clamp-2">
                          {n.message}
                        </span>
                        <span className="block text-[10px] text-text/40">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                      </span>
                    </button>

                    <div className="flex flex-col items-center gap-2 shrink-0">
                      {!n.isRead && (
                        <span
                          className="w-2 h-2 rounded-full bg-blue-500"
                          aria-label="Unread"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(n)}
                        aria-label="Delete notification"
                        className="p-1 rounded-md text-text/30 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!isLoading && !error && hasNext && (
              <div className="p-3 border-t border-border/60 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isLoadingMore}
                  onClick={() => void handleLoadMore()}
                >
                  Load more
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
