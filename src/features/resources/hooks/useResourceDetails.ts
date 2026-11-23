import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getResourceById,
  downloadResource,
  voteResource,
  saveResource,
} from "@/features/resources/api/resources.api";
import { calculateVoteTransition, applyVoteResponse } from "@/features/resources/utils/voteHelper";
import { normalizeResourceUpdate } from "@/features/resources/utils/liveUpdate";
import type {
  ResourceDetail,
  LinkPreviewResponseData,
} from "@/features/resources/types/resources.types";
import { getApiErrorMessage } from "@/shared/lib/utils/apiError";
import { useAuthStore } from "@/store";
import { useLiveHub } from "@/shared/hooks/useLiveHub";
import { toast } from "@/shared/hooks/useToast";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";

/** Loads one resource and exposes voting, saving, sharing and chapter/preview state for the details page. */
export function useResourceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadingPartId, setDownloadingPartId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [ogCoverImage, setOgCoverImage] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<boolean>(false);
  const [expandedPartPreviewId, setExpandedPartPreviewId] = useState<string | null>(null);

  const handlePreviewLoaded = useCallback(
    (preview: LinkPreviewResponseData): void => {
      if (!resource?.logoUrl && preview.imageUrl) {
        setOgCoverImage(preview.imageUrl);
      }
    },
    [resource?.logoUrl],
  );

  const [prevId, setPrevId] = useState<string | undefined>(id);
  if (id !== prevId) {
    setPrevId(id);
    setIsLoading(true);
    setError(null);
    setBannerError(false);
  }

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadResource(): Promise<void> {
      try {
        const res = await getResourceById(id as string);
        if (isMounted) {
          setResource(res.data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(getApiErrorMessage(err, "Failed to load resource details."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadResource();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Real-time updates via SignalR (/ws/hub/resources/{id}/live)
  useLiveHub({
    type: "resource",
    id,
    onUpdate: (data) => {
      const counts = normalizeResourceUpdate(data);
      if (!counts) return;
      setResource((prev) => (prev ? { ...prev, ...counts } : prev));
    },
  });

  const requireAuth = useRequireAuth();

  const handleVoteToggle = async (): Promise<void> => {
    if (!requireAuth("upvote this resource")) return;
    if (!resource) return;

    const currentVoteState = {
      upvoteCount: resource.upvoteCount ?? 0,
      downvoteCount: resource.downvoteCount ?? 0,
      isUpvotedByMe: Boolean(resource.isUpvotedByMe),
      isDownvotedByMe: Boolean(resource.isDownvotedByMe),
    };

    const transition = calculateVoteTransition(currentVoteState, 0);
    if (!transition.allowed) {
      if (transition.reason) {
        toast.info(transition.reason);
      }
      return;
    }

    // Optimistic update
    setResource((prev) =>
      prev
        ? {
            ...prev,
            isUpvotedByMe: transition.optimisticState.isUpvotedByMe,
            isDownvotedByMe: transition.optimisticState.isDownvotedByMe,
            upvoteCount: transition.optimisticState.upvoteCount,
            downvoteCount: transition.optimisticState.downvoteCount,
          }
        : null,
    );

    try {
      const res = await voteResource(resource.id, 0);
      const reconciled = applyVoteResponse(transition.optimisticState, res.data);
      setResource((prev) =>
        prev
          ? {
              ...prev,
              isUpvotedByMe: reconciled.isUpvotedByMe,
              isDownvotedByMe: reconciled.isDownvotedByMe,
              upvoteCount: reconciled.upvoteCount,
              downvoteCount: reconciled.downvoteCount,
            }
          : null,
      );
    } catch (err: unknown) {
      // Rollback
      setResource((prev) =>
        prev
          ? {
              ...prev,
              isUpvotedByMe: currentVoteState.isUpvotedByMe,
              isDownvotedByMe: currentVoteState.isDownvotedByMe,
              upvoteCount: currentVoteState.upvoteCount,
              downvoteCount: currentVoteState.downvoteCount,
            }
          : null,
      );
      toast.error(getApiErrorMessage(err, "Failed to record vote"));
    }
  };

  const handleDownvoteToggle = async (): Promise<void> => {
    if (!requireAuth("downvote this resource")) return;
    if (!resource) return;

    const currentVoteState = {
      upvoteCount: resource.upvoteCount ?? 0,
      downvoteCount: resource.downvoteCount ?? 0,
      isUpvotedByMe: Boolean(resource.isUpvotedByMe),
      isDownvotedByMe: Boolean(resource.isDownvotedByMe),
    };

    const transition = calculateVoteTransition(currentVoteState, 1);
    if (!transition.allowed) {
      if (transition.reason) {
        toast.info(transition.reason);
      }
      return;
    }

    // Optimistic update
    setResource((prev) =>
      prev
        ? {
            ...prev,
            isUpvotedByMe: transition.optimisticState.isUpvotedByMe,
            isDownvotedByMe: transition.optimisticState.isDownvotedByMe,
            upvoteCount: transition.optimisticState.upvoteCount,
            downvoteCount: transition.optimisticState.downvoteCount,
          }
        : null,
    );

    try {
      const res = await voteResource(resource.id, 1);
      const reconciled = applyVoteResponse(transition.optimisticState, res.data);
      setResource((prev) =>
        prev
          ? {
              ...prev,
              isUpvotedByMe: reconciled.isUpvotedByMe,
              isDownvotedByMe: reconciled.isDownvotedByMe,
              upvoteCount: reconciled.upvoteCount,
              downvoteCount: reconciled.downvoteCount,
            }
          : null,
      );
    } catch (err: unknown) {
      // Rollback
      setResource((prev) =>
        prev
          ? {
              ...prev,
              isUpvotedByMe: currentVoteState.isUpvotedByMe,
              isDownvotedByMe: currentVoteState.isDownvotedByMe,
              upvoteCount: currentVoteState.upvoteCount,
              downvoteCount: currentVoteState.downvoteCount,
            }
          : null,
      );
      toast.error(getApiErrorMessage(err, "Failed to record downvote"));
    }
  };

  const handleSaveToggle = async (): Promise<void> => {
    if (!requireAuth("save this resource")) return;
    if (!resource) return;
    const nextSaved = !resource.isSavedByMe;

    setResource((prev) =>
      prev
        ? {
            ...prev,
            isSavedByMe: nextSaved,
            saveCount: Math.max(0, prev.saveCount + (nextSaved ? 1 : -1)),
          }
        : null,
    );

    try {
      await saveResource(resource.id, nextSaved);
      toast.success(nextSaved ? "Resource saved to library" : "Removed from library");
    } catch (err: unknown) {
      setResource((prev) =>
        prev
          ? {
              ...prev,
              isSavedByMe: !nextSaved,
              saveCount: resource.saveCount,
            }
          : null,
      );
      toast.error(getApiErrorMessage(err, "Failed to update save status"));
    }
  };

  const handleDownload = async (partId?: string): Promise<void> => {
    if (!requireAuth("download this resource")) return;
    if (!resource) return;

    if (partId) {
      setDownloadingPartId(partId);
    } else {
      setIsDownloading(true);
    }

    try {
      const res = await downloadResource(resource.id, partId);
      if (res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, "_blank", "noopener,noreferrer");
        toast.success(`Download started: ${res.data.fileName || "File"}`);
      } else {
        toast.error("Download URL not provided by server");
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to initialize download"));
    } finally {
      if (partId) {
        setDownloadingPartId(null);
      } else {
        setIsDownloading(false);
      }
    }
  };

  const handleShare = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Could not copy link to clipboard");
    }
  };

  return {
    resource,
    setResource,
    isLoading,
    setIsLoading,
    error,
    setError,
    isDownloading,
    setIsDownloading,
    downloadingPartId,
    setDownloadingPartId,
    isCopied,
    setIsCopied,
    ogCoverImage,
    setOgCoverImage,
    bannerError,
    setBannerError,
    expandedPartPreviewId,
    setExpandedPartPreviewId,
    prevId,
    setPrevId,
    id,
    navigate,
    currentUser,
    handlePreviewLoaded,
    requireAuth,
    handleVoteToggle,
    handleDownvoteToggle,
    handleSaveToggle,
    handleDownload,
    handleShare,
  };
}

export type UseResourceDetailsResult = ReturnType<typeof useResourceDetails>;
