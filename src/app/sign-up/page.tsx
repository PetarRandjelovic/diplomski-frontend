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
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2>Sign Up</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <button type="submit">Create Account</button>
    </form>
  );
} 