"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Chat from '../../../components/Chat';
import { userService, UserDto } from '../../../services/userService/userService';

export default function ChatConversationPage() {
  const params = useParams();
  const userIdParam = Array.isArray(params.userId) ? params.userId[0] : params.userId;

  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [friend, setFriend] = useState<UserDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get logged-in user info
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
      fetchUserData(storedEmail);
    }
  }, []);

  // Fetch friend info
  useEffect(() => {
    if (userIdParam) {
      fetchFriend(userIdParam);
    }
  }, [userIdParam]);

  const fetchUserData = async (email: string) => {
    try {
      const userData = await userService.getUserByEmail(email);
      setUserId(userData.id);
    } catch (err) {
      setError('Failed to fetch user data.');
    }
  };

  const fetchFriend = async (id: string) => {
    try {
      const friendData = await userService.getUserById(Number(id));
      setFriend(friendData);
    } catch (err) {
      setError('Failed to fetch friend info.');
    }
  };

  if (!userId || !friend) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg shadow-md">
          <p className="text-gray-300">Loading chat...</p>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Chat
          userId={userId}
          userEmail={userEmail}
          receiverId={friend.id}
          receiverEmail={friend.email}
        />
      </div>
    </div>
  );
} 