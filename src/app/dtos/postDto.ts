import { TagDto } from "./tagDto";

export interface PostDto {
    id: number;
    userEmail: string;
    content: string;
    tags: TagDto[];
    creationDate: number;
    likes: number;
}