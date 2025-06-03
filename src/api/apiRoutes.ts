// This file was moved from api.ts to apiRoutes.ts. No content change needed. 

const API_BASE = "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to always return a plain object for headers
function buildHeaders(extra: Record<string, string> = {}) {
  return { ...getAuthHeaders(), ...extra } as Record<string, string>;
}

// Generic GET
export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Generic POST
export async function apiPost<T>(url: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Generic DELETE
export async function apiDelete<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Specific API functions
export function getAllPosts() {
  return apiGet("/posts/all");
}

export function getPostsByTags(tags: string[]) {
  const query = tags.map(tag => `tags=${encodeURIComponent(tag)}`).join('&');
  return apiGet(`/posts/tags?${query}`);
}

export function deletePost(id: number) {
  return apiDelete(`/posts/delete/${id}`);
}

// Add more as needed 