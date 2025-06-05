import { apiGet, apiPost, apiPut , apiDelete} from "./apiBase";
import { UserDto } from "@/app/dtos/userDto";

export function getUserById(id: number): Promise<UserDto> {
  return apiGet(`/users/${id}`);
}

export function getUserByEmail(email: string): Promise<UserDto> {
  return apiGet(`/users/email/${encodeURIComponent(email)}`);
}

export function updateUser(user: any): Promise<UserDto> {
  return apiPut("/users/update", user);
}

export function getUserFriendsCount(email: string): Promise<number> {
  return apiGet(`/relation/user-friends/${encodeURIComponent(email)}`);
}

export function getFriends(userId: number): Promise<UserDto[]> {
  return apiGet(`/users/friends/${userId}`);
}

export function getRecommendations(email: string): Promise<UserDto[]> {
  return apiGet(`/users/recommended/${encodeURIComponent(email)}`);
}

export function deleteUserByEmail(email: string): Promise<any> {
  return apiDelete(`/users/delete/${encodeURIComponent(email)}`);
}

// Add more user-related API functions as needed 