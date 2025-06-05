'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userService } from '../../services/userService/userService';
import { UserDto } from '@/app/dtos/userDto';

export default function ChatListPage() {
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [friends, setFriends] = useState<UserDto[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setIsAuthenticated(true);
      fetchFriends(userData.id);
    } catch (err) {
      setError('Failed to fetch user data. Please try again later.');
    }
  };

  const fetchFriends = async (id: number) => {
    try {
      const friendsList = await userService.getFriends(id);
      setFriends(friendsList);
    } catch (err) {
      setError('Failed to fetch friends. Please try again later.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center text-white">Login to Chat</h1>
          <p className="text-gray-300">Please log in to see your chats.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg shadow-md">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Your Chats</h1>
        <div className="grid gap-4">
          {friends.map((friend) => (
            <Link key={friend.id} href={`/chat/${friend.id}`} className="block">
              <div className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition text-white">
                <h2 className="text-lg font-semibold">{friend.username}</h2>
                <p className="text-gray-300">{friend.username}</p>
              </div>
            </Link>
          ))}
          {friends.length === 0 && (
            <p className="text-center text-gray-400">No chats found</p>
          )}
        </div>
      </div>
    </div>
  );
} 