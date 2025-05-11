'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ThemeProvider } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Container, Box, Button, Card, CardContent, Chip, TextField, List, ListItem, ListItemText, Divider } from "@mui/material";
import darkTheme from "@/themes/darkTheme";
import { useRouter } from "next/navigation";
import { PostDto } from "../../dtos/postDto";


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
  const [postLikes, setPostLikes] = useState(0);
  const [commentLikes, setCommentLikes] = useState<{ [key: number]: number }>({});
  const [hasLikedPost, setHasLikedPost] = useState(false);
  const [hasLikedComment, setHasLikedComment] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const email = localStorage.getItem("userEmail");
        // Fetch post
        const postResponse = await fetch(`http://localhost:8080/api/posts/id/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!postResponse.ok) throw new Error("Failed to fetch post");
        const postData = await postResponse.json();
        setPost(postData);

        // Fetch post likes
        const postLikesResponse = await fetch(`http://localhost:8080/api/like/post/${params.id}`);
        if (postLikesResponse.ok) {
          const likesCount = await postLikesResponse.json();
          console.log("Likes count from backend (post):", likesCount);
          setPostLikes(typeof likesCount === 'number' ? likesCount : likesCount.count);
        }

        // Fetch if user has liked post
        const likedPostRes = await fetch(`http://localhost:8080/api/like/post/${params.id}/liked?email=${email}`);
        if (likedPostRes.ok) setHasLikedPost(await likedPostRes.json());

        // Fetch comments
        const commentsResponse = await fetch(`http://localhost:8080/api/comments/commentsByPostId/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!commentsResponse.ok) throw new Error("Failed to fetch comments");
        const commentsData = await commentsResponse.json();
        setComments(commentsData);

        // Fetch likes for each comment
        const likesMap: { [key: number]: number } = {};
        const likedCommentsMap: { [key: number]: boolean } = {};
        await Promise.all(
          commentsData.map(async (comment: any) => {
            const res = await fetch(`http://localhost:8080/api/like/comment/${comment.id}`);
            if (res.ok) {
              const commentLikesCount = await res.json();
              console.log(`Likes count from backend (comment ${comment.id}):`, commentLikesCount);
              likesMap[comment.id] = typeof commentLikesCount === 'number' ? commentLikesCount : commentLikesCount.count;
            } else {
              likesMap[comment.id] = 0;
            }
            // Fetch if user has liked comment
            const likedRes = await fetch(`http://localhost:8080/api/like/comment/${comment.id}/liked?email=${email}`);
            likedCommentsMap[comment.id] = likedRes.ok ? await likedRes.json() : false;
          })
        );
        setCommentLikes(likesMap);
        setHasLikedComment(likedCommentsMap);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchPostAndComments();
  }, [params.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("authToken");
      // Updated endpoint and request body structure
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

  const handleHome = () => {
    router.push('/home');
  };

  const handleMyAccount = () => {
    router.push('/myAccount');
  };

  const handleExplore = () => {
    router.push('/explore');
  };

  const handleChat = () => {
    router.push('/chat');
  };

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
    if (response.ok) {
      setPostLikes(hasLikedPost ? postLikes - 1 : postLikes + 1);
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

  if (!post) return <div>Loading...</div>;

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My App
          </Typography>
          <Button color="inherit" onClick={handleHome}>Home</Button>
          <Button color="inherit" onClick={handleMyAccount}>My Account</Button>
          <Button color="inherit" onClick={handleExplore}>Explore</Button>
          <Button color="inherit" onClick={handleChat}>Chat</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ color: "text.primary" }}>
        {error && <Typography color="error">{error}</Typography>}
        
        {/* Post Content */}
        <Card sx={{ mb: 4, backgroundColor: "background.paper" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {post.content}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`Posted by: ${post.userEmail} on ${new Date(post.creationDate).toLocaleString()}`}
            </Typography>
            <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {post.tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  variant="outlined"
                  sx={{ color: "primary.main", borderColor: "primary.main" }}
                />
              ))}
            </Box>
            {/* Like button and count for post */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button onClick={handleLikePost} startIcon={<span role="img" aria-label="like">👍</span>} variant="outlined">
                {hasLikedPost ? "Unlike" : "Like"}
              </Button>
              <Typography variant="body2">{postLikes} {postLikes === 1 ? 'Like' : 'Likes'}</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>

        {/* Comment Form */}
        <Box component="form" onSubmit={handleSubmitComment} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!newComment.trim()}
          >
            Post Comment
          </Button>
        </Box>

        {/* Comments List */}
        <List>
          {comments.map((comment) => (
            <React.Fragment key={comment.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={comment.content}
                  secondary={
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      display="block"
                    >
                      {`Posted by: ${comment.email} on ${comment.creationDate ? new Date(comment.creationDate).toLocaleString() : ''}`}
                    </Typography>
                  }
                />
                {/* Like button and count for comment, moved outside Typography */}
              </ListItem>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, ml: 8 }}>
                <Button onClick={() => handleLikeComment(comment.id)} startIcon={<span role="img" aria-label="like">👍</span>} variant="outlined" size="small">
                  {hasLikedComment[comment.id] ? "Unlike" : "Like"}
                </Button>
                <Typography variant="body2">{commentLikes[comment.id] || 0} {commentLikes[comment.id] === 1 ? 'Like' : 'Likes'}</Typography>
              </Box>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </Container>
    </ThemeProvider>
  );
};

export default PostPage; 