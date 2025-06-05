'use client';
import React, { useEffect, useState } from 'react';
import { getUserByEmail, updateUser, getUserFriendsCount } from "@/api/apiUserRoutes";
import { UserDto } from "@/app/dtos/userDto";

const MyAccount: React.FC = () => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [friendsCount, setFriendsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const email = localStorage.getItem('userEmail');
                if (!email) {
                    throw new Error('User email not found');
                }
                const userData = (await getUserByEmail(email)) as UserDto;
                setUser(userData);
                setNewUsername(userData.username);
                const friends = await getUserFriendsCount(email);
                setFriendsCount(Number(friends));
            } catch (err) {
                setError('Failed to load user data');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            setLoading(true);
            const updatedUser = await updateUser({ ...user, username: newUsername });
            setUser(updatedUser);
            setError(null);
        } catch (err) {
            setError('Failed to update username');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="bg-red-600 text-white p-4 rounded shadow">{error}</div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <div className="card w-full max-w-lg p-6">
                <h2 className="mb-4 text-center text-2xl font-bold">My Account</h2>
                <form onSubmit={handleUpdateUsername}>
                    <div className="mb-3">
                        <label className="block mb-1">Email</label>
                        <input type="email" value={user?.email || ''} disabled readOnly className="input" />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Username</label>
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            autoComplete="username"
                            className="input"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full mb-3" disabled={loading || !newUsername.trim()}>
                        Update Username
                    </button>
                </form>
                <div className="mt-4 text-center text-gray-400">Friends: {friendsCount}</div>
            </div>
        </div>
    );
};

export default MyAccount; 