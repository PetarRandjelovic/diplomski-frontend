"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const Navbar = () => {
  const router = useRouter();
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ 
    id: number; 
    email: string; 
    username: string; 
    role: string;
    profilePicture?: string;
  }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [profilePictures, setProfilePictures] = useState<{ [id: number]: string }>({});

  useEffect(() => {
    const searchUsers = async () => {
      if (userSearch.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `http://localhost:8080/api/users/search/users?query=${encodeURIComponent(userSearch)}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (err) {
        setSearchResults([]);
      }
    };
    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [userSearch]);

  // Fetch profile picture by user id if not present
  useEffect(() => {
    const fetchProfilePictures = async () => {
      const usersWithoutPic = searchResults.filter(
        user => !user.profilePicture && !profilePictures[user.id]
      );
      for (const user of usersWithoutPic) {
        try {
          const res = await fetch(`http://localhost:8080/api/profiles/id/${user.id}`);
          if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setProfilePictures(prev => ({ ...prev, [user.id]: url }));
          }
        } catch (e) {
          // Optionally handle error
        }
      }
    };
    if (searchResults.length > 0) {
      fetchProfilePictures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserClick = (userId: number) => {
    setUserSearch("");
    setShowResults(false);
    router.push(`/profile/${userId}`);
  };

  return (
    <nav className="bg-gray-900 text-white shadow mb-4">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <div
          className="font-bold text-xl cursor-pointer"
          onClick={() => router.push('/home')}
        >
          My App
        </div>
        <div className="flex items-center space-x-4">
          <button className="hover:text-primary-400 transition" onClick={() => router.push('/home')}>Home</button>
          <button className="hover:text-primary-400 transition" onClick={() => router.push('/my-account')}>My Account</button>
          <button className="hover:text-primary-400 transition" onClick={() => router.push('/group-chat')}>Group chat</button>
          <button className="hover:text-primary-400 transition" onClick={() => router.push('/chat')}>Chat</button>
          <button className="hover:text-primary-400 transition" onClick={() => router.push('/network')}>Network</button>
          <button className="hover:text-primary-400 transition" onClick={() => router.push('/posts/create')}>Create Post</button>
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={e => {
                setUserSearch(e.target.value);
                setShowResults(true);
              }}
              className="input w-48 text-gray-900 placeholder-gray-700 ml-2"
              onFocus={() => setShowResults(true)}
            />
            {showResults && userSearch.trim().length > 1 && searchResults.length > 0 && (
              <div className="absolute z-20 w-72 bg-white rounded shadow mt-1 max-h-60 overflow-y-auto">
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    className="px-4 py-2 cursor-pointer hover:bg-primary-100 text-gray-900 border-b last:border-b-0 flex items-center gap-3"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {(user.profilePicture || profilePictures[user.id]) ? (
                        <Image
                          src={user.profilePicture || profilePictures[user.id]}
                          alt={`${user.username}'s profile`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{user.username}</div>
                      <div className="text-xs text-gray-600 truncate">{user.email}</div>
                      <div className="text-xs text-gray-500">Role: {user.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showResults && userSearch.trim().length > 1 && searchResults.length === 0 && (
              <div className="absolute z-20 w-full bg-white rounded shadow mt-1 p-2 text-gray-500 text-sm">No users found.</div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 