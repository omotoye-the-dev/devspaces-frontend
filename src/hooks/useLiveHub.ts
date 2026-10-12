import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { createLiveHubConnection, type LiveHubType } from "@/lib/signalr/signalr";

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
}: UseLiveHubOptions<T>): signalR.HubConnection | null {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
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
    const connection = createLiveHubConnection(type, id);
    connectionRef.current = connection;

    // Backend broadcasts updates via the "update" method
    connection.on("update", (data: T) => {
      if (!isCancelled) {
        callbackRef.current(data);
      }
    });

    async function start(): Promise<void> {
      try {
        await connection.start();
        if (import.meta.env.DEV) {
          console.log(`[SignalR] Connected to ${type} live hub for ID: ${id}`);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.warn(`[SignalR] Failed to connect to ${type} live hub:`, err);
        }
      }
    }

    void start();

    return () => {
      isCancelled = true;
      connection.off("update");
      void connection.stop().catch(() => {
        // Ignore stop errors on unmount
      });
      connectionRef.current = null;
    };
  }, [type, id, enabled]);

  return connectionRef.current;
}
