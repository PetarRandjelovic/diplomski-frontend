"use client";
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { userService } from '../../../services/userService/userService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getUserById } from '@/api/apiUserRoutes';

interface GroupMessageDTO {
  groupId: number;
  senderId: number;
  content: string;
  timestamp?: string;
}

export default function GroupChatConversationPage() {
  const params = useParams();
  const groupIdParam = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId;
  const groupId = Number(groupIdParam);

  const [userEmail, setUserEmail] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<GroupMessageDTO[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);
  const [userMap, setUserMap] = useState<{ [id: number]: string }>({});

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
      setUserEmail(userData.email);
      setUserUsername(userData.username);
      console.log(userData);
    } catch (err) {
      setError('Failed to fetch user data.');
    }
  };

  // Fetch group chat history on mount or when groupId changes
  useEffect(() => {
    if (!groupId) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/group-chat/history/${groupId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchHistory();
  }, [groupId]);

  useEffect(() => {
    if (!userId || !groupId) return;
    // Connect to WebSocket
    const client = new Client({
      webSocketFactory: () => new SockJS(`http://localhost:8080/ws?user=${userEmail}`),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/group.${groupId}`, (message) => {
        const groupMessage: GroupMessageDTO = JSON.parse(message.body);
        setMessages((prev) => [...prev, groupMessage]);
        scrollToBottom();
      });
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
    // eslint-disable-next-line
  }, [userId, groupId]);

  // Fetch user emails for all unique senderIds in messages
  useEffect(() => {
    const uniqueSenderIds = Array.from(new Set(messages.map(m => m.senderId)));
    const idsToFetch = uniqueSenderIds.filter(id => !(id in userMap));
    if (idsToFetch.length === 0) return;

    const fetchEmails = async () => {
      const newMap: { [id: number]: string } = {};
      await Promise.all(idsToFetch.map(async (id) => {
        try {
          const user = await getUserById(id);
          newMap[id] = user.username;
        } catch (e) {
          // handle error
        }
      }));
      setUserMap(prev => ({ ...prev, ...newMap }));
    };

    fetchEmails();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;
    const message: GroupMessageDTO = {
      groupId,
      senderId: userId,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };
    stompClientRef.current?.publish({
      destination: '/app/group.send',
      body: JSON.stringify(message),
    });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700 bg-gray-900 rounded-t-lg">
        <h2 className="text-2xl font-bold text-white">
          Group Chat
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-800">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                message.senderId === userId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-white'
              }`}
            >
              <div className="flex items-center mb-1">
                <span className="text-xs font-semibold opacity-80">
                  {userMap[message.senderId] || `User ${message.senderId}`}
                </span>
              </div>
              <div className="text-base mb-1 break-words">{message.content}</div>
              <div className="text-xs text-right opacity-60">
                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white placeholder-gray-400"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 