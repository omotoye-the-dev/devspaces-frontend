import { useEffect, useRef } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { createLiveHubConnection, type LiveHubType } from "@/shared/lib/signalr/signalr";

export interface UseLiveHubOptions<T = unknown> {
  type: LiveHubType;
  id: string | null | undefined;
  onUpdate: (data: T) => void;
  enabled?: boolean;
}

/**
 * Subscribes to real-time SignalR live hub updates for a specific entity.
 * Listens on the backend method: "update".
 *
 * Example endpoints:
 * - /ws/hub/posts/{id}/live
 * - /ws/hub/posts/comments/{id}/live
 * - /ws/hub/resources/{id}/live
 */
export function useLiveHub<T = unknown>({
  type,
  id,
  onUpdate,
  enabled = true,
}: UseLiveHubOptions<T>): void {
  const connectionRef = useRef<HubConnection | null>(null);
  const callbackRef = useRef(onUpdate);

  // Keep callback reference fresh without triggering effect reconnects
  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!enabled || !id) {
      return;
    }

    let isCancelled = false;
    let connection: HubConnection | null = null;

    async function connect(): Promise<void> {
      const conn = await createLiveHubConnection(type, id as string);
      if (isCancelled) return; // unmounted while the library was loading
      connection = conn;
      connectionRef.current = conn;

      // Backend broadcasts updates via the "update" method
      conn.on("update", (data: T) => {
        if (!isCancelled) {
          callbackRef.current(data);
        }
      });

      try {
        await conn.start();
        if (import.meta.env.DEV) {
          console.log(`[SignalR] Connected to ${type} live hub for ID: ${id}`);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.warn(`[SignalR] Failed to connect to ${type} live hub:`, err);
        }
      }
    }

    void connect();

    return () => {
      isCancelled = true;
      if (connection) {
        connection.off("update");
        void connection.stop().catch(() => {
          // Ignore stop errors on unmount
        });
      }
      connectionRef.current = null;
    };
  }, [type, id, enabled]);
}
