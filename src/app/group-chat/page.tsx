"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { userService } from '../../services/userService/userService';
import axios from 'axios';
import { UserDto } from '../dtos/userDto';

const API_URL = "http://localhost:8080/api";

interface UserGroupsDto {
  id: number;
  name: string;
  membersId: number[];
}

export default function GroupChatListPage() {
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [groups, setGroups] = useState<UserGroupsDto[]>([]);
  const [friends, setFriends] = useState<UserDto[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
      fetchUserData(storedEmail);
    }
  }, []);

  const fetchUserData = async (email: string) => {
    try {
      const userData = await userService.getUserByEmail(email);
      setUserId(userData.id);
      fetchGroups(userData.id);
      fetchFriends(userData.id);
    } catch (err) {
      setError('Failed to fetch user data.');
    }
  };

  const fetchGroups = async (id: number) => {
    try {
      const res = await axios.get(`${API_URL}/groups-management/my?userId=${id}`);
      setGroups(res.data);
    } catch (err) {
      setError('Failed to fetch groups.');
    }
  };

  const fetchFriends = async (id: number) => {
    try {
      const friendsList = await userService.getFriends(id);
      setFriends(friendsList);
    } catch (err) {
      setError('Failed to fetch friends.');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || selectedFriendIds.length === 0 || !userId) return;
    try {
      // Always include the current user in the group
      const memberIds = Array.from(new Set([...selectedFriendIds, userId]));
      await axios.post(`${API_URL}/groups-management/create`, {
        name: groupName,
        memberIds,
      });
      setSuccess('Group created!');
      setShowCreate(false);
      setGroupName('');
      setSelectedFriendIds([]);
      fetchGroups(userId);
    } catch (err) {
      setError('Failed to create group.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Your Group Chats</h1>
        <button
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? 'Cancel' : 'Create New Group'}
        </button>
        {showCreate && (
          <form onSubmit={handleCreateGroup} className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-white mb-2">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2">Select Friends</label>
              <div className="grid grid-cols-2 gap-2">
                {friends.map((friend) => (
                  <label key={friend.id} className="flex items-center text-white">
                    <input
                      type="checkbox"
                      value={friend.id}
                      checked={selectedFriendIds.includes(friend.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFriendIds((prev) => [...prev, friend.id]);
                        } else {
                          setSelectedFriendIds((prev) => prev.filter((id) => id !== friend.id));
                        }
                      }}
                      className="mr-2"
                    />
                    {friend.username} ({friend.email})
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Group
            </button>
          </form>
        )}
        {success && <p className="text-green-400 mb-4">{success}</p>}
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <div className="grid gap-4">
          {groups.map((group) => (
            <Link key={group.id} href={`/group-chat/${group.id}`} className="block">
              <div className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition text-white">
                <h2 className="text-lg font-semibold">{group.name}</h2>
                <p className="text-gray-300">Members: {group.membersId.length}</p>
              </div>
            </Link>
          ))}
          {groups.length === 0 && (
            <p className="text-center text-gray-400">No group chats found</p>
          )}
        </div>
      </div>
    </div>
  );
} 