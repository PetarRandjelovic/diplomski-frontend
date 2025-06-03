import { apiGet } from "./apiBase";

export interface MediaDto {
  id: number;
  postId: number;
  url: string;
  title: string;
  type: 'IMAGE' | 'VIDEO';
}

// Example: get all media for a post
export function getMediaByPostId(postId: number): Promise<MediaDto[]> {
  return apiGet(`/media/post/${postId}`);
}

// Add more /media endpoints as needed 