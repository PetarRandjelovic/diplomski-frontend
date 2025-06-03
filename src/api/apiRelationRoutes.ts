import { apiGet, apiPost } from "./apiBase";

export interface UserRelationshipDto {
  id: number;
  userId: number;
  email: string;
  followedUserId: number;
  followedEmail: string;
}

export interface UserRelationshipRecord {
  user1: string;
  user2: string;
  status: string; // or enum if you have one
}

export function getUserFriendsCount(email: string): Promise<number> {
  return apiGet(`/relation/user-friends/${encodeURIComponent(email)}`);
}

export function getFollowersList(email: string): Promise<UserRelationshipDto[]> {
  return apiGet(`/relation/following/${encodeURIComponent(email)}`);
}

export function getFollowingList(email: string): Promise<UserRelationshipDto[]> {
  return apiGet(`/relation/followed/${encodeURIComponent(email)}`);
}

export function getIncomingFriendRequests(email: string): Promise<UserRelationshipRecord[]> {
  return apiGet(`/relation/incoming/${encodeURIComponent(email)}`);
}

export function getRelationshipStatus(myEmail: string, otherEmail: string): Promise<UserRelationshipRecord> {
  return apiGet(`/relation/relationship-status/${encodeURIComponent(myEmail)}/${encodeURIComponent(otherEmail)}`);
}

export function sendFriendRequest(emailSender: string, emailReceiver: string): Promise<any> {
  return apiPost("/relation/create-request", { emailSender, emailReceiver });
}

export function answerFriendRequest(emailSender: string, emailReceiver: string, status: boolean): Promise<any> {
  return apiPost("/relation/confirm-decline", { emailSender, emailReceiver, status });
}

// Add more /relation endpoints as needed 