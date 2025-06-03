import { apiGet } from "./apiBase";

export interface Comment {
  id: number;
  content: string;
  email: string;
  userEmail?: string;
  creationDate?: number;
  postId?: number;
}

export function getCommentsByPostId(postId: number): Promise<Comment[]> {
  return apiGet(`/comments/commentsByPostId/${postId}`);
} 