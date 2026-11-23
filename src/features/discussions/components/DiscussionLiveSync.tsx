import { useLiveHub } from "@/shared/hooks/useLiveHub";
import {
  normalizeDiscussionUpdate,
  type DiscussionCounts,
} from "@/features/discussions/utils/liveUpdate";

/**
 * Render-null component that subscribes to the SignalR live hub for a single
 * discussion and forwards normalised count updates to the parent page.
 *
 * One instance is mounted next to each DiscussionCard so the page owns a
 * single list-state and cards stay purely prop-driven.
 * Hub: /ws/hub/discussions/{id}/live
 */
export function DiscussionLiveSync({
  id,
  onCounts,
}: {
  id: string;
  onCounts: (id: string, counts: DiscussionCounts) => void;
}): null {
  useLiveHub({
    type: "discussion",
    id,
    onUpdate: (data) => {
      const counts = normalizeDiscussionUpdate(data);
      if (counts) onCounts(id, counts);
    },
  });
  return null;
}
