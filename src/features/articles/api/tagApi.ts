import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export interface Tag {
  id?: string;
  name: string;
  slug?: string;
  usageCount?: number;
  createdAt?: string;
}

export interface TagPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TagsResponse {
  success: boolean;
  message: string;
  data: Tag[];
  pagination?: TagPagination;
}

export interface GetTagsParams {
  page?: number;
  pageNumber?: number;
  pageSize?: number;
}

function normalizeTags(rawItems: unknown[]): Tag[] {
  return rawItems
    .map((item): Tag | null => {
      if (typeof item === "string") {
        return { name: item };
      }
      if (
        item &&
        typeof item === "object" &&
        "name" in item &&
        typeof (item as { name: unknown }).name === "string"
      ) {
        return item as Tag;
      }
      return null;
    })
    .filter((tag): tag is Tag => tag !== null);
}

/** GET /api/tags — handles paginated responses, envelope wrapping, and string/object tag arrays */
export async function getTags(params?: GetTagsParams): Promise<Tag[]> {
  const response = await apiClient.get<
    TagsResponse | Tag[] | string[] | { data?: Tag[] | string[] }
  >(ENDPOINTS.TAGS.LIST, { params });

  const body = response.data;

  if (Array.isArray(body)) {
    return normalizeTags(body);
  }

  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    Array.isArray(body.data)
  ) {
    return normalizeTags(body.data);
  }

  return [];
}

/** GET /api/tags — returns the full paginated response with data and pagination metadata */
export async function getTagsPaginated(params?: GetTagsParams): Promise<TagsResponse> {
  const response = await apiClient.get<TagsResponse>(ENDPOINTS.TAGS.LIST, { params });
  return response.data;
}
