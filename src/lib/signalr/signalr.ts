import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "@/lib/api/endpoints";

export type LiveHubType = "post" | "comment" | "resource" | "discussion" | "discussion-comment";

/**
 * Returns the hub endpoint URL based on entity type and target ID.
 */
export function getLiveHubUrl(type: LiveHubType, id: string): string {
  const normalizedId = encodeURIComponent(id.trim());
  const baseUrl = (API_BASE_URL || "").replace(/\/+$/, "");

  switch (type) {
    case "post":
      return `${baseUrl}/ws/hub/posts/${normalizedId}/live`;
    case "comment":
      return `${baseUrl}/ws/hub/posts/comments/${normalizedId}/live`;
    case "resource":
      return `${baseUrl}/ws/hub/resources/${normalizedId}/live`;
    case "discussion":
      return `${baseUrl}/ws/hub/discussions/${normalizedId}/live`;
    case "discussion-comment":
      return `${baseUrl}/ws/hub/discussions/comments/${normalizedId}/live`;
    default:
      return `${baseUrl}/ws/hub/${type}/${normalizedId}/live`;
  }
}

/**
 * Creates and configures a SignalR HubConnection for real-time live updates.
 * Backend uses the "update" method name for broadcast messages.
 */
export function createLiveHubConnection(
  type: LiveHubType,
  id: string,
  token?: string | null,
): signalR.HubConnection {
  const url = getLiveHubUrl(type, id);

  return new signalR.HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: () => {
        if (token) return token;
        return (
          (typeof window !== "undefined"
            ? localStorage.getItem("devspace_token")
            : null) || ""
        );
      },
      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(
      import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning,
    )
    .build();
}

/**
 * Creates a SignalR connection to the per-user notifications hub.
 * The backend pushes new notifications on the "ReceiveNotification" event.
 */
export function createNotificationHubConnection(token?: string | null): signalR.HubConnection {
  const baseUrl = (API_BASE_URL || "").replace(/\/+$/, "");

  return new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/ws/hub/notifications`, {
      accessTokenFactory: () => {
        if (token) return token;
        return (
          (typeof window !== "undefined"
            ? localStorage.getItem("devspace_token")
            : null) || ""
        );
      },
      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(
      import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning,
    )
    .build();
}
