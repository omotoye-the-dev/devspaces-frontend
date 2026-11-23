import type { SelectOption } from "@/shared/ui";

export const SORT_OPTIONS: SelectOption[] = [
  { label: "Most Upvoted", value: "most_upvoted" },
  { label: "Most Recent", value: "most_recent" },
  { label: "Most Downloaded", value: "most_downloaded" },
  { label: "Most Saved", value: "most_saved" },
];

export const CATEGORY_PARAM_MAP: Record<string, string> = {
  all: "",
  courses: "Course",
  documentation: "Documentation",
  books: "Book",
  videos: "Video",
  repositories: "Repository",
  tools: "Tool",
};

export const SORT_PARAM_MAP: Record<string, string> = {
  most_upvoted: "upvotes",
  most_recent: "newest",
  most_downloaded: "downloads",
  most_saved: "saves",
};
