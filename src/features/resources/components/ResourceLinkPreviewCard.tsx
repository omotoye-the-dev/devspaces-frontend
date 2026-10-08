import { useState, useEffect, useRef, type JSX } from "react";
import { FiExternalLink, FiGlobe, FiShare2, FiCheck } from "react-icons/fi";
import { Skeleton } from "@/components/common";
import { previewLink } from "../api/resources.api";
import type { LinkPreviewResponseData } from "@/types/resources.types";
import { cn } from "@/lib/utils/cn";
import { toast } from "@/hooks/useToast";

export interface ResourceLinkPreviewCardProps {
  url: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  className?: string;
  onPreviewLoaded?: (preview: LinkPreviewResponseData) => void;
}

function getHostname(urlString: string): string {
  try {
    return new URL(urlString).hostname.replace(/^www\./, "");
  } catch {
    return urlString;
  }
}

export function ResourceLinkPreviewCard({
  url,
  fallbackTitle,
  fallbackDescription,
  className = "",
  onPreviewLoaded,
}: ResourceLinkPreviewCardProps): JSX.Element {
  const [preview, setPreview] = useState<LinkPreviewResponseData | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Keep a ref to onPreviewLoaded to avoid unnecessary re-fetch loops on parent re-renders
  const onPreviewLoadedRef = useRef(onPreviewLoaded);
  useEffect(() => {
    onPreviewLoadedRef.current = onPreviewLoaded;
  });

  const [prevUrl, setPrevUrl] = useState<string | undefined>(url);
  if (url !== prevUrl) {
    setPrevUrl(url);
    const clean = url?.trim();
    let isValid = false;
    if (clean) {
      try {
        const parsed = new URL(clean);
        isValid = ["http:", "https:"].includes(parsed.protocol);
      } catch {
        isValid = false;
      }
    }
    setIsLoading(isValid);
    setImageError(false);
  }

  useEffect(() => {
    const cleanUrl = url?.trim();
    if (!cleanUrl) {
      return;
    }

    try {
      const parsed = new URL(cleanUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return;
      }
    } catch {
      return;
    }

    let isMounted = true;

    async function fetchPreview(): Promise<void> {
      try {
        const response = await previewLink(cleanUrl as string);
        if (isMounted && response.data) {
          setPreview(response.data);
          setCurrentImageUrl(response.data.imageUrl || null);
          onPreviewLoadedRef.current?.(response.data);
        }
      } catch {
        // Fall back gracefully if link preview scraping fails or is rate-limited (429)
        if (isMounted) {
          setPreview(null);
          setCurrentImageUrl(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchPreview();

    return () => {
      isMounted = false;
    };
  }, [url]);

  const handleCopy = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleImageError = (): void => {
    // If the image was an opengraph.githubassets.com image and failed with 429/error,
    // fallback gracefully to the GitHub owner's public avatar which never 429s
    if (currentImageUrl?.includes("githubassets.com")) {
      try {
        const parsed = new URL(url);
        const segments = parsed.pathname.split("/").filter(Boolean);
        if (segments.length >= 1) {
          const owner = segments[0];
          const fallbackAvatar = `https://github.com/${owner}.png?size=200`;
          if (currentImageUrl !== fallbackAvatar) {
            setCurrentImageUrl(fallbackAvatar);
            return;
          }
        }
      } catch {
        // ignore
      }
    }
    setImageError(true);
  };

  const domain = getHostname(url);
  const displayTitle = preview?.title || fallbackTitle || domain;
  const displayDescription = preview?.description || fallbackDescription || url;
  const siteName = preview?.siteName || domain;
  const showImage = Boolean(currentImageUrl && !imageError);

  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full rounded-2xl border border-border bg-slate-50/50 p-4 sm:p-5 space-y-4 animate-pulse",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <Skeleton className="w-full sm:w-44 h-28 rounded-xl shrink-0" />
          <div className="space-y-2.5 w-full">
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3.5 w-5/6 rounded" />
            <div className="pt-2 flex gap-2">
              <Skeleton className="h-8 w-28 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative w-full rounded-2xl border border-border bg-white hover:border-primary/40 transition-all duration-200 overflow-hidden shadow-2xs",
        className,
      )}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-stretch">
        {/* Thumbnail Preview (if OpenGraph image is available) */}
        {showImage && (
          <div className="w-full sm:w-48 sm:min-w-48 h-36 sm:h-auto rounded-xl overflow-hidden bg-slate-100 border border-border/60 shrink-0 relative">
            <img
              src={currentImageUrl || undefined}
              alt={displayTitle}
              onError={handleImageError}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Content Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            {/* Site / Domain badge */}
            <div className="flex items-center gap-2 text-xs text-text/60">
              {preview?.faviconUrl ? (
                <img
                  src={preview.faviconUrl}
                  alt=""
                  className="w-4 h-4 rounded-sm object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <FiGlobe className="w-3.5 h-3.5 text-primary" />
              )}
              <span className="font-semibold text-text/70">{siteName}</span>
              <span className="text-text/30">•</span>
              <span className="truncate text-text/50">{domain}</span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors line-clamp-1">
              {displayTitle}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-text/60 line-clamp-2 leading-relaxed">
              {displayDescription}
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-2xs"
            >
              <span>Visit Link</span>
              <FiExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-text/70 hover:text-text hover:bg-slate-50 transition-colors shadow-2xs"
              title="Copy URL"
            >
              {isCopied ? (
                <>
                  <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <FiShare2 className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-text/40 truncate max-w-55 hidden md:inline ml-auto">
              {url}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourceLinkPreviewCard;
