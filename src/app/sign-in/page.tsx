'use client';
import { useState } from "react";
import { loginUser } from "@/services/auth";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    try {
      const response = await loginUser(email, password);
      if (response) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userEmail', email);
        const tokenParts = response.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const role = payload.role || payload.authorities?.[0];
          if (role) {
            localStorage.setItem('role', role);
          }
        }
        router.push('/home');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSignUpRedirect = () => {
    router.push('/sign-up');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="mb-4 text-center text-2xl font-extrabold text-white">Login</h2>
        {error && <div className="bg-red-600 text-white p-2 rounded mb-2">{error}</div>}
        <form onSubmit={e => { e.preventDefault(); handleLogin(); }}>
          <div className="mb-3">
            <label className="block mb-1 text-gray-200 font-semibold">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-200 font-semibold">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full mb-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
          >
            Login
          </button>
          <button 
            type="button" 
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors" 
            onClick={handleSignUpRedirect}
          >
            Create new account
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
