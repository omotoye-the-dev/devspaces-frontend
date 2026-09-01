import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export interface Tag {
  id?: string;
  name: string;
  slug?: string;
}

/** GET /api/tags — handles both string[] and Tag[] responses */
export async function getTags(): Promise<Tag[]> {
  const response = await apiClient.get<Tag[] | string[]>(ENDPOINTS.TAGS.LIST);
  const data = response.data;
  if (!Array.isArray(data) || data.length === 0) return [];
  if (typeof data[0] === "string") {
    return (data as string[]).map((name) => ({ name }));
  }
  return data as Tag[];
}
