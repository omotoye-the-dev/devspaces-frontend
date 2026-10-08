/**
 * Generic API response envelope
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | string | null;
}

/**
 * Standard pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Paginated API response envelope
 */
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Resource Access Type
 * 0 or "FileUpload" - Resource is an uploaded file attachment
 * 1 or "ExternalLink" - Resource is an external webpage/URL
 */
export const ResourceAccessType = {
  FileUpload: 0,
  ExternalLink: 1,
} as const;

export type ResourceAccessTypeValue =
  (typeof ResourceAccessType)[keyof typeof ResourceAccessType];

export type ResourceAccessTypeString = "FileUpload" | "ExternalLink";

/**
 * Image upload response data
 */
export interface UploadImageResponseData {
  url: string;
  publicId: string;
}

/**
 * Raw file upload response data
 */
export interface UploadFileResponseData {
  url: string;
  publicId: string;
  fileName: string;
  fileSizeBytes: number;
  format: string;
}

/**
 * Resource tag
 */
export interface ResourceTag {
  id?: string;
  name: string;
  slug?: string;
}

/**
 * Resource uploader profile
 */
export interface ResourceUploader {
  userId: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
}

/**
 * Resource sub-part
 */
export interface ResourcePart {
  partId: string;
  title: string;
  description?: string | null;
  accessType: ResourceAccessTypeString | number;
  contentUrl?: string | null;
  downloadUrl?: string | null;
  sequenceOrder: number;
  createdAt?: string;
}

/**
 * File details for uploaded resource
 */
export interface ResourceFileDetails {
  fileUrl: string;
  publicId: string;
  fileName: string;
  fileSizeBytes: number;
  format: string;
}

/**
 * Link preview data
 */
export interface LinkPreviewResponseData {
  targetUrl?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  faviconUrl?: string;
}

/**
 * Detailed Resource object returned by GET /api/resources/{id} and POST /api/resources
 */
export interface ResourceDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  accessType: ResourceAccessTypeString | number;
  logoUrl?: string | null;
  externalUrl?: string | null;
  tags: ResourceTag[];
  uploader: ResourceUploader;
  partsCount: number;
  upvoteCount: number;
  downvoteCount?: number;
  downloadCount: number;
  saveCount: number;
  isSavedByMe: boolean;
  isUpvotedByMe: boolean;
  isDownvotedByMe?: boolean;
  createdAt: string;
  linkPreview?: LinkPreviewResponseData | null;
  fileDetails?: ResourceFileDetails | null;
  parts: ResourcePart[];
}

/**
 * Resource item returned by the feed list
 */
export interface ResourceListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  accessType: ResourceAccessTypeString | number;
  logoUrl?: string | null;
  externalUrl?: string | null;
  tags: ResourceTag[];
  uploader: ResourceUploader;
  partsCount: number;
  upvoteCount: number;
  downvoteCount?: number;
  downloadCount: number;
  saveCount: number;
  isSavedByMe: boolean;
  isUpvotedByMe: boolean;
  isDownvotedByMe?: boolean;
  createdAt: string;
}

/**
 * Category item returned by GET /api/resources/categories
 */
export interface ResourceCategoryItem {
  name: string;
  count: number;
}

/**
 * Vote response data
 */
export interface VoteResourceResponseData {
  resourceId: string;
  upvoteCount: number;
  downvoteCount?: number;
  saveCount: number;
  isSaved: boolean;
  isUpvoted: boolean;
  isDownvoted?: boolean;
}

/**
 * Download response data
 */
export interface DownloadResourceResponseData {
  downloadUrl: string;
  fileName: string;
  totalDownloads: number;
}

/**
 * Input for creating a resource via multipart/form-data
 */
export interface CreateResourceInput {
  title: string;
  description: string;
  category: string;
  accessType: ResourceAccessTypeValue | number;
  tags?: string[];
  externalUrl?: string | null;
  logoFile?: File | null;
  resourceFile?: File | null;
}

/**
 * Input for updating a resource details via PUT /api/resources/{id}
 */
export interface UpdateResourceInput {
  title?: string;
  description?: string;
  category?: string;
  accessType?: ResourceAccessTypeValue | number;
  tags?: string[];
  externalUrl?: string | null;
  logoFile?: File | null;
  resourceFile?: File | null;
}

/**
 * Input for query parameters when fetching feed
 */
export interface ResourceQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  uploaderId?: string;
  username?: string;
  tag?: string;
  accessType?: number;
  sortBy?: "newest" | "upvotes" | "downloads" | "saves" | string;
}

/**
 * Input for adding a sub-part
 */
export interface AddResourcePartInput {
  title: string;
  description?: string;
  accessType: ResourceAccessTypeValue | number;
  contentUrl?: string;
  partFile?: File | null;
  sequenceOrder: number;
}

/**
 * Input for updating an existing sub-part via PUT /api/resources/{id}/parts/{partId}
 */
export interface UpdateResourcePartInput {
  title?: string;
  description?: string;
  accessType?: ResourceAccessTypeValue | number;
  contentUrl?: string;
  partFile?: File | null;
  sequenceOrder?: number;
}

/**
 * Part reordering item
 */
export interface ReorderPartItem {
  partId: string;
  sequenceOrder: number;
}

/**
 * Helper to determine whether a resource part is a file upload or external link
 */
export function isPartAFile(part: ResourcePart): boolean {
  if (part.accessType === 0 || part.accessType === "FileUpload") {
    return true;
  }
  if (part.accessType === 1 || part.accessType === "ExternalLink") {
    return false;
  }
  if (part.contentUrl && !part.downloadUrl) {
    return false;
  }
  return Boolean(part.downloadUrl);
}
