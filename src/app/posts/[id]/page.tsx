'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import { Container, Row, Col, Card, Button, Alert, Badge, Nav, Form, Spinner, ListGroup } from 'react-bootstrap';
import { PostDto } from "../../dtos/postDto";
import Post from "@/components/Post";
import { getCommentsByPostId } from "@/api/apiCommentRoutes";

interface Comment {
  id: number;
  content: string;
  email: string;
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!post) return <div className="text-light text-center mt-5">Loading...</div>;

  return (
    <div className="bg-dark min-vh-100">
      <Container>
        {post && (
          <Post
            post={post}
            onDelete={(userRole === 'ADMIN' || userRole === 'ROLE_ADMIN' || userEmail === post.userEmail) ? () => handleDeletePost() : undefined}
            showDelete={userRole === 'ADMIN' || userRole === 'ROLE_ADMIN' || userEmail === post.userEmail}
          />
        )}
        <h5 className="text-light mb-3">Comments</h5>
        <Form onSubmit={handleSubmitComment} className="mb-4">
          <Form.Group className="mb-2">
            <Form.Control
              as="textarea"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
            />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={!newComment.trim()}>
            Post Comment
          </Button>
        </Form>
        <ListGroup variant="flush">
          {comments.map((comment) => (
            <ListGroup.Item key={comment.id} className="bg-dark text-light border-secondary">
              <div className="fw-bold">{comment.content}</div>
              <div className="small text-secondary mb-2">
                Posted by: {comment.email} on {comment.creationDate ? new Date(comment.creationDate).toLocaleString() : ''}
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button variant={hasLikedComment[comment.id] ? "success" : "outline-light"} size="sm" onClick={() => handleLikeComment(comment.id)}>
                  <span role="img" aria-label="like">👍</span> {hasLikedComment[comment.id] ? "Unlike" : "Like"}
                </Button>
                <span className="text-light">{commentLikes[comment.id] || 0} {(commentLikes[comment.id] === 1 ? 'Like' : 'Likes')}</span>
                {(comment.email === userEmail || userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Container>
    </div>
  );
};

export default PostPage; 