'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import Post from "@/components/Post";
import { getCommentsByPostId } from "@/api/apiCommentRoutes";
import { PostDto } from "../../dtos/postDto";
import { getUserByEmail } from "@/api/apiUserRoutes"; 

interface Comment {
  id: number;
  content: string;
  email: string;
  username?: string;
  userEmail?: string;
  creationDate?: number;
  postId?: number;
}

const PostPage = () => {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<PostDto | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [commentLikes, setCommentLikes] = useState<{ [key: number]: number }>({});
  const [hasLikedPost, setHasLikedPost] = useState(false);
  const [hasLikedComment, setHasLikedComment] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userUsername, setUserUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const email = localStorage.getItem("userEmail");
        const postResponse = await fetch(`http://localhost:8080/api/posts/id/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!postResponse.ok) throw new Error("Failed to fetch post");
        const postData = await postResponse.json();
        setPost(postData);
        const likedPostRes = await fetch(`http://localhost:8080/api/like/post/${params.id}/liked?email=${email}`);
        if (likedPostRes.ok) setHasLikedPost(await likedPostRes.json());
        const commentsData = await getCommentsByPostId(Number(params.id));
        setComments(commentsData);
        const likesMap: { [key: number]: number } = {};
        const likedCommentsMap: { [key: number]: boolean } = {};
        await Promise.all(
          commentsData.map(async (comment: any) => {
            const res = await fetch(`http://localhost:8080/api/like/comment/${comment.id}`);
            if (res.ok) {
              const commentLikesCount = await res.json();
              likesMap[comment.id] = typeof commentLikesCount === 'number' ? commentLikesCount : commentLikesCount.count;
            } else {
              likesMap[comment.id] = 0;
            }
            const likedRes = await fetch(`http://localhost:8080/api/like/comment/${comment.id}/liked?email=${email}`);
            likedCommentsMap[comment.id] = likedRes.ok ? await likedRes.json() : false;
          })
        );
        setCommentLikes(likesMap);
        setHasLikedComment(likedCommentsMap);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchPostAndComments();
  }, [params.id]);

  useEffect(() => {
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('userEmail');
  
    setUserRole(role);
    setUserEmail(email);
  
    if (email) {
      getUserByEmail(email)
        .then((user) => setUserUsername(user.username))
        .catch((err) => console.error("Failed to fetch username", err));
    }
  }, []);
  

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
    setUserEmail(localStorage.getItem('userEmail'));
  }, []);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:8080/api/comments/commentPostId/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (!response.ok) throw new Error("Failed to post comment");
      const newCommentData = await response.json();
      setComments([...comments, newCommentData]);
      setNewComment('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleHome = () => router.push('/home');
  const handleMyAccount = () => router.push('/edit-account');
  const handleExplore = () => router.push('/explore');
  const handleChat = () => router.push('/chat');
  const handleLikePost = async () => {
    const token = localStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail");
    const response = await fetch(`http://localhost:8080/api/like/like-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId: Number(params.id), email }),
    });
    if (response.ok && post) {
      setPost({ ...post, likes: hasLikedPost ? post.likes - 1 : post.likes + 1 });
      setHasLikedPost(!hasLikedPost);
    }
  };
  const handleLikeComment = async (commentId: number) => {
    const token = localStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail");
    const response = await fetch(`http://localhost:8080/api/like/like-comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ commentId, email }),
    });
    if (response.ok) {
      setCommentLikes((prev) => ({
        ...prev,
        [commentId]: hasLikedComment[commentId] ? (prev[commentId] || 1) - 1 : (prev[commentId] || 0) + 1
      }));
      setHasLikedComment((prev) => ({
        ...prev,
        [commentId]: !prev[commentId]
      }));
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:8080/api/posts/delete/${params.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete post');

      // Redirect to home page after successful deletion
      router.push('/home');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:8080/api/comments/delete/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete comment');
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Function to check if user can delete a comment
  const canDeleteComment = (comment: Comment): boolean => {
    // Admin can delete any comment
    if (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') {
      return true;
    }

    console.log(post?.username, userUsername);
    if(post?.username === userUsername){
      return true;
    }

    // User can delete their own comment
    if(userUsername === comment.username || userUsername === comment.username){
      return true;
    }

    return false;
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

  if (!post) return <div className="text-white text-center mt-5">Loading...</div>;

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="container mx-auto py-8">
        {post && (
          <>
            <Post
              post={post}
              onDelete={(userRole === 'ADMIN' || userRole === 'ROLE_ADMIN' || userEmail === post.userEmail) ? () => handleDeletePost() : undefined}
              showDelete={userRole === 'ADMIN' || userRole === 'ROLE_ADMIN' || userEmail === post.userEmail}
            />
            <div className="flex items-center gap-3 mb-8">
              <button
                type="button"
                className={`flex items-center gap-1 px-3 py-2 rounded text-base font-semibold transition ${hasLikedPost ? 'bg-primary-600 text-white' : 'bg-gray-700 text-primary-400 hover:bg-primary-700'}`}
                onClick={handleLikePost}
              >
                <span>{hasLikedPost ? '👍' : '👍'}</span>
                {hasLikedPost ? 'Unlike' : 'Like'}
              </button>
              <span className="text-gray-300 text-base">{post.likes} {post.likes === 1 ? 'Like' : 'Likes'}</span>
            </div>
          </>
        )}
        <h5 className="text-lg font-semibold mb-3 mt-8">Comments</h5>
        <form onSubmit={handleSubmitComment} className="mb-4">
          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="input mb-2"
          />
          <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
            Post Comment
          </button>
        </form>
        {comments.length === 0 ? (
          <div className="text-gray-400 mt-4">No comments yet.</div>
        ) : (
          <div className="space-y-4 mt-4">
            {comments.map(comment => (
              <div key={comment.id} className="bg-gray-800 rounded-lg p-4 text-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-primary-400">{comment.username || comment.email}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{comment.creationDate ? new Date(comment.creationDate).toLocaleString() : ''}</span>
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                          className="ml-2 px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                        title="Delete comment"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <div className="mb-2">{comment.content}</div>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-semibold transition ${hasLikedComment[comment.id] ? 'bg-primary-600 text-white' : 'bg-gray-700 text-primary-400 hover:bg-primary-700'}`}
                    onClick={() => handleLikeComment(comment.id)}
                  >
                    <span>{hasLikedComment[comment.id] ? '👍' : '👍'}</span>
                    {hasLikedComment[comment.id] ? 'Unlike' : 'Like'}
                  </button>
                  <span className="text-gray-300 text-sm">{commentLikes[comment.id] || 0} {commentLikes[comment.id] === 1 ? 'Like' : 'Likes'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage;