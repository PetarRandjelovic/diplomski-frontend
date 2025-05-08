'use client';

import React, { useEffect, useState, useRef } from 'react';
import { webSocketService, ChatMessage } from '../services/WebSocketService';

interface ChatProps {
  userEmail: string;
  receiverEmail: string;
}

export default function Chat({ userEmail, receiverEmail }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Connect to WebSocket when component mounts
    webSocketService.connect(userEmail);

    // Subscribe to messages
    const handleMessage = (message: ChatMessage) => {
      console.log('Received message in Chat:', message); // Debug log
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

    const message: ChatMessage = {
      content: newMessage,
      senderEmail: userEmail,
      receiverEmail: receiverEmail,
      timestamp: new Date().toISOString(),
    };

    webSocketService.sendMessage(message);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Chat with {receiverEmail}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.senderEmail === userEmail ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderEmail === userEmail
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <p className="text-xs font-semibold mb-1">
                {message.senderEmail}
              </p>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 