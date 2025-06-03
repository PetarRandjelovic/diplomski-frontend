import { apiGet } from "./apiBase";

export interface TagDto {
  id: number;
  name: string;
}

export function getAllTags(): Promise<TagDto[]> {
  return apiGet("/tags/all");
}

// Add more /tags endpoints as needed 