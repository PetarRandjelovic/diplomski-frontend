'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    dateOfBirth: '',
    role: 'USER'
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dateOfBirth: new Date(form.dateOfBirth).getTime(),
        }),
      });
      if (!res.ok) throw new Error('Sign up failed');
      router.push('/sign-in');
    } catch (err) {
      setError('Sign up failed. Try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-6">
        <h2 className="mb-4 text-center text-2xl font-extrabold text-gray-900">Sign Up</h2>
        {error && <div className="bg-red-600 text-white p-2 rounded mb-2">{error}</div>}
        <div className="mb-3">
          <label className="block mb-1 text-gray-900 font-semibold">Username</label>
          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required className="input" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-gray-900 font-semibold">Email</label>
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="input" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-gray-900 font-semibold">Date of Birth</label>
          <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required className="input" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-gray-900 font-semibold">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="input">
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-900 font-semibold">Password</label>
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="input" />
        </div>
        <button type="submit" className="btn btn-primary w-full font-semibold">Create Account</button>
      </form>
    </div>
  );
} 