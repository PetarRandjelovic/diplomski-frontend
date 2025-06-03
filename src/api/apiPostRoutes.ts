import { apiGet, apiPost, apiDelete } from "./apiBase";

export function getAllPosts() {
  return apiGet("/posts/all");
}

export function getPostsByTags(tags: string[]) {
  const query = tags.map(tag => `tags=${encodeURIComponent(tag)}`).join('&');
  return apiGet(`/posts/tags?${query}`);
}

export function getPostById(id: number) {
  return apiGet(`/posts/id/${id}`);
}

export function deletePost(id: number) {
  return apiDelete(`/posts/delete/${id}`);
}

// Add more post-related API functions as needed 