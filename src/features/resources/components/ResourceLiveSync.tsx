import { useLiveHub } from "@/shared/hooks/useLiveHub";
import {
  normalizeResourceUpdate,
  type ResourceCounts,
} from "@/features/resources/utils/liveUpdate";

/** Invisible helper: subscribes to live vote/save counts for one resource. */
export function ResourceLiveSync({
  id,
  onCounts,
}: {
  id: string;
  onCounts: (id: string, counts: ResourceCounts) => void;
}): null {
  useLiveHub({
    type: "resource",
    id,
    onUpdate: (data) => {
      const counts = normalizeResourceUpdate(data);
      if (counts) onCounts(id, counts);
    },
  });
  return null;
}
