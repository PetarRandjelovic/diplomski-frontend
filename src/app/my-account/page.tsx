'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  content: string;
  creationDate: number;
}

export default function MyAccount() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          setError('User not logged in');
          return;
        }
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:8080/api/posts/email/${encodeURIComponent(userEmail)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();
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

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ marginBottom: 0 }}>My Posts</h2>
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
          <div
            key={post.id}
            style={{
              background: '#444',
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onClick={() => handlePostClick(post.id)}
            onMouseOver={e => (e.currentTarget.style.background = '#555')}
            onMouseOut={e => (e.currentTarget.style.background = '#444')}
            title="Click to view comments"
          >
            <h4>{post.title}</h4>
            <div style={{ color: '#bbb', fontSize: 14, marginBottom: 8 }}>
              {new Date(post.creationDate).toLocaleString()}
            </div>
            <div>{post.content}</div>
          </div>
        ))
      )}
    </div>
  );
}