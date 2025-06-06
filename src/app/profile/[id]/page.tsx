"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Post from "@/components/Post";
import { getUserById } from "@/api/apiUserRoutes";
import { UserDto } from "@/app/dtos/userDto";
import { PostDto } from "@/app/dtos/postDto";

export default function UserProfilePage() {
  const params = useParams();
  const idParam = params.id;
  const id = typeof idParam === 'string' ? idParam : Array.isArray(idParam) ? idParam[0] : '';
  const [user, setUser] = useState<UserDto | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<PostDto[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      setError("Invalid user id parameter.");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const userData = await getUserById(Number(id)) as UserDto;
        setUser(userData);
        // Fetch profile picture if needed
        if (userData.id) {
          const token = localStorage.getItem('authToken');
          const picRes = await fetch(`http://localhost:8080/api/profiles/id/${userData.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (picRes.ok) {
            const blob = await picRes.blob();
            setProfilePicture(URL.createObjectURL(blob));
          }
        }
      } catch (err) {
        setError("Could not load user profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:8080/api/posts/userId/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchPosts();
  }, [id]);

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;
  if (!user) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>User not found.</div>;


  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', color: '#fff' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', marginBottom: 32 }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ color: '#666', fontSize: 48 }}>👤</div>
          )}
        </div>
        <div>
          <h2 style={{ margin: 0 }}>{user.username}</h2>
          <div style={{ color: '#bbb', fontSize: 16 }}>{user.email}</div>
          <div style={{ color: '#bbb', fontSize: 16 }}>Role: {user.role}</div>
          <div style={{ color: '#bbb', fontSize: 16 }}>Date of Birth: {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
        </div>
      </div>
      <div style={{ marginTop: 32 }}>
        <h3>User's Posts</h3>
        {posts.length === 0 ? (
          <div style={{ color: '#bbb' }}>No posts yet.</div>
        ) : (
          posts.map((post: any) => (
            <div key={post.id} style={{ marginBottom: 16 }}>
              <Post post={post} onClick={() => router.push(`/posts/${post.id}`)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
} 