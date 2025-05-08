'use client';

import { useState, useEffect } from 'react';
import Chat from '../../components/Chat';

export default function ChatPage() {
  const [userEmail, setUserEmail] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [receiverInput, setReceiverInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail);
      setIsAuthenticated(true);
    }
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (receiverInput) {
      setReceiverEmail(receiverInput);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Login to Chat</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Start Chatting
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!receiverEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Start a Chat</h1>
          <form onSubmit={handleStartChat} className="space-y-4">
            <div>
              <label htmlFor="receiver" className="block text-sm font-medium text-gray-700">
                Recipient's Email
              </label>
              <input
                type="email"
                id="receiver"
                value={receiverInput}
                onChange={(e) => setReceiverInput(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Start Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Chat userEmail={userEmail} receiverEmail={receiverEmail} />
    </div>
  );
} 