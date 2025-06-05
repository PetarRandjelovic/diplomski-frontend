import { TagDto } from "./tagDto";
import { MediaDto } from "./mediaDto";

export interface PostDto {
  id: number;
  userEmail: string;
  username?: string;
  content: string;
  tags: TagDto[];
  creationDate: number;
  likes: number;
  media?: MediaDto[];
}