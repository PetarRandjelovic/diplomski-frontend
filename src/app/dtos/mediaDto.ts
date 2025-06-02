export interface MediaDto {
    id: number;
    postId: number;
    url: string;
    title: string;
    type: 'IMAGE' | 'VIDEO';
} 