import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface UserDto {
    id: number;
    dateOfBirth: number;
    email: string;
    username: string;
    role: string;
}

export interface UserRelationshipDto {
    id: number;
    userId: number;
    email: string;
    followedUserId: number;
    followedEmail: string;
}

export const userService = {
    async updateUsername(userDto: UserDto): Promise<UserDto> {
        const response = await axios.put(`${API_URL}/users/update`, userDto);
        return response.data;
    },

    async getUserFriendsCount(email: string): Promise<number> {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/relation/user-friends/${email}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async getUserByEmail(email: string): Promise<UserDto> {
        const response = await axios.get(`${API_URL}/users/email/${email}`);
        return response.data;
    },

    async getFollowersList(email: string): Promise<UserRelationshipDto[]> {
        const response = await axios.get(`${API_URL}/relation/following/${email}`);
        return response.data;
    },

    async getFollowingList(email: string): Promise<UserRelationshipDto[]> {
        const response = await axios.get(`${API_URL}/relation/followed/${email}`);
        return response.data;
    },

    async getFriends(userId: number): Promise<UserDto[]> {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/users/friends/${userId}`, {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    async getRecommendations(email: string): Promise<UserDto[]> {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/users/recommended/${email}`, {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    async getUserById(id: number): Promise<UserDto> {
        const response = await axios.get(`${API_URL}/users/${id}`);
        return response.data;
    }
}; 