"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Chat from '../../../components/Chat';
import { userService } from '../../../services/userService/userService';
import { UserDto } from '@/app/dtos/userDto';
import Image from 'next/image';

export default function ChatConversationPage() {
  const params = useParams();
  const userIdParam = Array.isArray(params.userId) ? params.userId[0] : params.userId;

  const [userEmail, setUserEmail] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [friend, setFriend] = useState<UserDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

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
      setUserUsername(userData.username);
    } catch (err) {
      setError('Failed to fetch user data.');
    }
  };

  const fetchFriend = async (id: string) => {
    try {
      const friendData = await userService.getUserById(Number(id));
      setFriend(friendData);
      if (friendData.profilePicture) {
        setProfilePicUrl(friendData.profilePicture);
      } else {
        try {
          const res = await fetch(`http://localhost:8080/api/profiles/id/${friendData.id}`);
          if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setProfilePicUrl(url);
          } else {
            setProfilePicUrl(null);
          }
        } catch {
          setProfilePicUrl(null);
        }
      }
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
        <div className="flex items-center gap-4 bg-gray-800 rounded-t-lg px-6 py-4 border-b border-gray-700">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-300">
            {profilePicUrl ? (
              <Image src={profilePicUrl} alt={friend?.username + "'s profile"} width={48} height={48} style={{ objectFit: 'cover' }} />
            ) : (
              friend?.username?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <h2 className="text-2xl font-bold text-white">
            Chat with <span className="text-blue-400">{friend?.username}</span>
          </h2>
        </div>
        <Chat
          userId={userId}
          userEmail={userEmail}
          receiverId={friend.id}
          receiverEmail={friend.email}
          receiverUsername={friend.username}
          userUsername={userUsername}
        />
      </div>
    </div>
  );
} 