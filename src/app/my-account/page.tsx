'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostDto } from '../dtos/postDto';
import Post from "@/components/Post";

export default function MyAccount() {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfilePicture = async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;
      try {
        const res = await fetch(`http://localhost:8080/api/profiles/email/${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error('Failed to fetch profile picture');
        const blob = await res.blob();
        setProfilePicture(URL.createObjectURL(blob));
      } catch (err) {
        setProfilePicture(null);
      }
    };
    fetchProfilePicture();
  }, []);

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      alert('User email not found');
      setUploading(false);
      return;
    }
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`http://localhost:8080/api/profiles/${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload image');
      // Re-fetch the profile picture
      const imgRes = await fetch(`http://localhost:8080/api/profiles/email/${encodeURIComponent(userEmail)}`);
      if (imgRes.ok) {
        const blob = await imgRes.blob();
        setProfilePicture(URL.createObjectURL(blob));
      }
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          setError('User not logged in');
          return;
        }
        const token = localStorage.getItem('authToken');
        console.log(token);
        const res = await fetch(`http://localhost:8080/api/posts/email/${encodeURIComponent(userEmail)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();
        console.log(data);
        setPosts(data);
      } catch (err) {
        setError('Could not load your posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePostClick = (postId: number) => {
    router.push(`/posts/${postId}`);
  };

  const handleDeletePost = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:8080/api/posts/delete/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete post');
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            {profilePicture ? (
              <img 
                src={profilePicture} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ color: '#666', fontSize: 24 }}>👤</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicUpload}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
              title="Upload profile picture"
              disabled={uploading}
            />
            {uploading && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                borderRadius: '50%',
              }}>Uploading...</div>
            )}
          </div>
          <h2 style={{ marginBottom: 0 }}>My Posts</h2>
        </div>
        <button
          style={{
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: 16,
          }}
          onClick={() => router.push('/edit-account')}
        >
          Edit Account
        </button>
      </div>
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center' }}>You have not created any posts yet.</div>
      ) : (
        posts.map(post => (
          <div key={post.id} style={{ marginBottom: 16 }}>
            <Post
              post={post}
              onDelete={handleDeletePost}
              onClick={() => handlePostClick(post.id)}
              showDelete={true}
            />
          </div>
        ))
      )}
    </div>
  );
}