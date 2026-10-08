import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiResponse,
  PaginatedResponse,
  ResourceDetail,
  ResourceListItem,
  ResourceCategoryItem,
  UploadImageResponseData,
  UploadFileResponseData,
  CreateResourceInput,
  UpdateResourceInput,
  ResourceQueryParams,
  AddResourcePartInput,
  UpdateResourcePartInput,
  ReorderPartItem,
  VoteResourceResponseData,
  DownloadResourceResponseData,
  LinkPreviewResponseData,
  ResourcePart,
} from "@/types/resources.types";

/**
 * Uploads a standalone logo/cover image for a resource.
 * POST /api/resources/upload-image
 */
export async function uploadResourceImage(
  file: File,
): Promise<ApiResponse<UploadImageResponseData>> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<ApiResponse<UploadImageResponseData>>(
    ENDPOINTS.RESOURCES.UPLOAD_IMAGE,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

/**
 * Uploads a standalone raw document or file attachment before or alongside resource creation.
 * POST /api/resources/upload-file
 */
export async function uploadResourceFile(
  file: File,
): Promise<ApiResponse<UploadFileResponseData>> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<ApiResponse<UploadFileResponseData>>(
    ENDPOINTS.RESOURCES.UPLOAD_FILE,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

/**
 * Creates and publishes a new resource via multipart/form-data.
 * POST /api/resources
 */
export async function createResource(
  payload: CreateResourceInput,
): Promise<ApiResponse<ResourceDetail>> {
  const formData = new FormData();
  formData.append("Title", payload.title);
  formData.append("Description", payload.description);
  formData.append("Category", payload.category);
  formData.append("AccessType", String(payload.accessType));

  if (payload.externalUrl) {
    formData.append("ExternalUrl", payload.externalUrl);
  }

  if (payload.logoFile) {
    formData.append("LogoFile", payload.logoFile);
  }

  if (payload.resourceFile) {
    formData.append("ResourceFile", payload.resourceFile);
  }

  if (payload.tags && payload.tags.length > 0) {
    payload.tags.forEach((tag, index) => {
      formData.append(`Tags[${index}]`, tag);
    });
  }

  const response = await apiClient.post<ApiResponse<ResourceDetail>>(
    ENDPOINTS.RESOURCES.BASE,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

/**
 * Searches and browses the resources feed with filtering, search query, and pagination.
 * GET /api/resources
 */
export async function getResources(
  params?: ResourceQueryParams,
): Promise<PaginatedResponse<ResourceListItem>> {
  const response = await apiClient.get<PaginatedResponse<ResourceListItem>>(
    ENDPOINTS.RESOURCES.BASE,
    {
      params,
    },
  );

  return response.data;
}

/**
 * Fetches full resource details by ID including sub-parts.
 * GET /api/resources/{id}
 */
export async function getResourceById(
  id: string,
): Promise<ApiResponse<ResourceDetail>> {
  const response = await apiClient.get<ApiResponse<ResourceDetail>>(
    ENDPOINTS.RESOURCES.DETAIL(id),
  );

  return response.data;
}

/**
 * Returns available categories in use along with live resource counts.
 * GET /api/resources/categories
 */
export async function getResourceCategories(): Promise<
  ApiResponse<ResourceCategoryItem[]>
> {
  const response = await apiClient.get<ApiResponse<ResourceCategoryItem[]>>(
    ENDPOINTS.RESOURCES.CATEGORIES,
  );

  return response.data;
}

// In-memory cache for scraped link previews to prevent rate-limiting (429) and duplicate fetches
const linkPreviewCache = new Map<string, ApiResponse<LinkPreviewResponseData>>();

/**
 * Scrapes OpenGraph tags for external links in real time.
 * POST /api/resources/preview-link
 */
export async function previewLink(
  url: string,
): Promise<ApiResponse<LinkPreviewResponseData>> {
  const normalized = url.trim();
  const cached = linkPreviewCache.get(normalized);
  if (cached) {
    return cached;
  }

  const response = await apiClient.post<ApiResponse<LinkPreviewResponseData>>(
    ENDPOINTS.RESOURCES.PREVIEW_LINK,
    { url: normalized },
  );

  linkPreviewCache.set(normalized, response.data);
  return response.data;
}

/**
 * Updates an existing resource via multipart/form-data.
 * PUT /api/resources/{id}
 */
export async function updateResource(
  id: string,
  payload: UpdateResourceInput,
): Promise<ApiResponse<ResourceDetail>> {
  const formData = new FormData();
  if (payload.title !== undefined) {
    formData.append("Title", payload.title);
  }
  if (payload.description !== undefined) {
    formData.append("Description", payload.description);
  }
  if (payload.category !== undefined) {
    formData.append("Category", payload.category);
  }
  if (payload.accessType !== undefined) {
    formData.append("AccessType", String(payload.accessType));
  }
  if (payload.externalUrl !== undefined) {
    formData.append("ExternalUrl", payload.externalUrl || "");
  }
  if (payload.logoFile) {
    formData.append("LogoFile", payload.logoFile);
  }
  if (payload.resourceFile) {
    formData.append("ResourceFile", payload.resourceFile);
  }
  if (payload.tags && payload.tags.length > 0) {
    payload.tags.forEach((tag, index) => {
      formData.append(`Tags[${index}]`, tag);
    });
  }

  const response = await apiClient.put<ApiResponse<ResourceDetail>>(
    ENDPOINTS.RESOURCES.DETAIL(id),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

/**
 * Permanently deletes a resource.
 * DELETE /api/resources/{id}
 */
export async function deleteResource(
  id: string,
): Promise<ApiResponse<unknown>> {
  const response = await apiClient.delete<ApiResponse<unknown>>(
    ENDPOINTS.RESOURCES.DETAIL(id),
  );

  return response.data;
}

/**
 * Casts, modifies, or clears a vote for a resource.
 * - Adding vote (0 -> 1 or 0 -> -1): Uses POST /api/resources/{id}/vote?value={value}
 * - Removing vote (1 -> 0 or -1 -> 0): Uses DELETE /api/resources/{id}/vote (fallback to POST ?value=0)
 * - Changing vote (1 -> -1 or -1 -> 1): Uses PUT /api/resources/{id}/vote (fallback to POST ?value={value})
 */
export async function voteResource(
  id: string,
  value: -1 | 0 | 1,
  previousVote: -1 | 0 | 1 = 0,
): Promise<ApiResponse<VoteResourceResponseData>> {
  // Case 1: Removing vote to 0 -> USE DELETE
  if (value === 0) {
    try {
      const response = await apiClient.delete<ApiResponse<VoteResourceResponseData>>(
        ENDPOINTS.RESOURCES.VOTE_BASE(id),
      );
      return response.data;
    } catch {
      // Fallback to POST /vote?value=0
      const fallback = await apiClient.post<ApiResponse<VoteResourceResponseData>>(
        ENDPOINTS.RESOURCES.VOTE(id, 0),
      );
      return fallback.data;
    }
  }

  // Case 2: Changing between upvote and downvote (1 -> -1 or -1 -> 1) -> USE PUT
  if (previousVote !== 0 && previousVote !== value) {
    try {
      const response = await apiClient.put<ApiResponse<VoteResourceResponseData>>(
        ENDPOINTS.RESOURCES.VOTE_BASE(id),
        { value },
      );
      return response.data;
    } catch {
      // Fallback to POST /vote?value={value}
      const fallback = await apiClient.post<ApiResponse<VoteResourceResponseData>>(
        ENDPOINTS.RESOURCES.VOTE(id, value),
      );
      return fallback.data;
    }
  }

  // Case 3: Adding a vote from neutral 0 -> USE POST
  const response = await apiClient.post<ApiResponse<VoteResourceResponseData>>(
    ENDPOINTS.RESOURCES.VOTE(id, value),
  );

  return response.data;
}

/**
 * Saves or unsaves (bookmarks) a resource.
 * POST /api/resources/{id}/save?saved=true (or saved=false)
 */
export async function saveResource(
  id: string,
  saved: boolean,
): Promise<ApiResponse<unknown>> {
  const response = await apiClient.post<ApiResponse<unknown>>(
    ENDPOINTS.RESOURCES.SAVE(id, saved),
  );

  return response.data;
}

/**
 * Initializes download for a resource or a specific sub-part.
 * POST /api/resources/{id}/download?partId=...
 */
export async function downloadResource(
  id: string,
  partId?: string,
): Promise<ApiResponse<DownloadResourceResponseData>> {
  const response = await apiClient.post<ApiResponse<DownloadResourceResponseData>>(
    ENDPOINTS.RESOURCES.DOWNLOAD(id, partId),
  );

  return response.data;
}

/**
 * Adds a sub-part (chapter/lesson) to an existing resource.
 * POST /api/resources/{id}/parts
 */
export async function addResourcePart(
  resourceId: string,
  payload: AddResourcePartInput,
): Promise<ApiResponse<ResourcePart>> {
  const formData = new FormData();
  formData.append("Title", payload.title);
  formData.append("AccessType", String(payload.accessType));
  formData.append("SequenceOrder", String(payload.sequenceOrder));

  if (payload.description) {
    formData.append("Description", payload.description);
  }

  if (payload.contentUrl) {
    formData.append("ContentUrl", payload.contentUrl);
  }

  if (payload.partFile) {
    formData.append("PartFile", payload.partFile);
  }

  const response = await apiClient.post<ApiResponse<ResourcePart>>(
    ENDPOINTS.RESOURCES.PARTS(resourceId),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

/**
 * Updates a specific sub-part of an existing resource.
 * PUT /api/resources/{id}/parts/{partId}
 */
export async function updateResourcePart(
  resourceId: string,
  partId: string,
  payload: UpdateResourcePartInput,
): Promise<ApiResponse<ResourcePart>> {
  const formData = new FormData();
  if (payload.title !== undefined) {
    formData.append("Title", payload.title);
  }
  if (payload.description !== undefined) {
    formData.append("Description", payload.description);
  }
  if (payload.accessType !== undefined) {
    formData.append("AccessType", String(payload.accessType));
  }
  if (payload.sequenceOrder !== undefined) {
    formData.append("SequenceOrder", String(payload.sequenceOrder));
  }
  if (payload.contentUrl !== undefined) {
    formData.append("ContentUrl", payload.contentUrl);
  }
  if (payload.partFile) {
    formData.append("PartFile", payload.partFile);
  }

  const response = await apiClient.put<ApiResponse<ResourcePart>>(
    ENDPOINTS.RESOURCES.PART_DETAIL(resourceId, partId),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

/**
 * Permanently deletes a specific sub-part of a resource.
 * DELETE /api/resources/{id}/parts/{partId}
 */
export async function deleteResourcePart(
  resourceId: string,
  partId: string,
): Promise<ApiResponse<unknown>> {
  const response = await apiClient.delete<ApiResponse<unknown>>(
    ENDPOINTS.RESOURCES.PART_DETAIL(resourceId, partId),
  );

  return response.data;
}

/**
 * Reorders parts of a resource.
 * PUT /api/resources/{id}/parts/reorder
 */
export async function reorderResourceParts(
  resourceId: string,
  parts: ReorderPartItem[],
): Promise<ApiResponse<unknown>> {
  const response = await apiClient.put<ApiResponse<unknown>>(
    ENDPOINTS.RESOURCES.REORDER_PARTS(resourceId),
    { parts },
  );

  return response.data;
}
