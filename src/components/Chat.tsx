'use client';

import React, { useEffect, useState, useRef } from 'react';
import { webSocketService } from '../services/WebSocketService';

interface ChatProps {
  userId: number;
  userEmail: string;
  receiverId: number;
  receiverEmail: string;
}

interface ChatMessage {
  senderId: number;
  receiverId: number;
  content: string;
  timestamp?: string;
}

export default function Chat({ userId, userEmail, receiverId, receiverEmail }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history when userId or receiverId changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId || !receiverId) return;
      try {
        const res = await fetch(`http://localhost:8080/api/chat/history?user1=${userId}&user2=${receiverId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchHistory();
  }, [userId, receiverId]);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    webSocketService.connect(userEmail);

    // Subscribe to messages
    const handleMessage = (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    };

    webSocketService.onMessage(handleMessage);

    // Only add user after connection is established
    webSocketService.onConnectCallback(() => {
      webSocketService.addUser(userEmail);
    });

    // Cleanup on unmount
    return () => {
      webSocketService.removeMessageHandler(handleMessage);
      webSocketService.disconnect();
    };
  }, [userEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      senderId: userId,
      receiverId: receiverId,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    webSocketService.sendMessage(message);
    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700 bg-gray-900 rounded-t-lg">
        <h2 className="text-2xl font-bold text-white">
          Chat with <span className="text-blue-400">{receiverEmail}</span>
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-800">
        {messages
          .filter(
            (message) =>
              !message.content?.toLowerCase().includes('joined the chat')
          )
          .map((message, index) => (
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
                    {message.senderId === userId ? userEmail : receiverEmail}
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