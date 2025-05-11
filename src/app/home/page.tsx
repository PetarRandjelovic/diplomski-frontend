'use client';
import { useEffect, useState } from "react";
import { PostDto } from "../dtos/postDto";
import { ThemeProvider } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Container, Box, Button, Card, CardContent, Chip } from "@mui/material";
import darkTheme from "@/themes/darkTheme";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Retrieve token from localStorage or context
        console.log(token);
        const response = await fetch("http://localhost:8080/api/posts/all", {
          headers: {
            Authorization: `Bearer ${token}`, // Add Authorization header
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data: PostDto[] = await response.json();
        setPosts(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchPosts();
  }, []);
  
  const handleHome = () => {
    router.push('/home'); // Redirect to the sign-up route
  };


  const handleMyAccount = () => {
    router.push('/myAccount'); // Redirect to the sign-up route
  };

  const handleExplore = () => {
    router.push('/explore'); // Redirect to the sign-up route
  };

  const handleChat = () => {
    router.push('/chat'); // Redirect to the sign-up route
  };

  const handleCreatePost = () => {
    router.push('/posts/create');
  };

  const handlePostClick = (postId: number) => {
    router.push(`/posts/${postId}`);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      {/* Menu Bar */}
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My App
          </Typography>
          <Button color="inherit" onClick={handleHome}>Home</Button>
          <Button color="inherit" onClick={handleMyAccount}>My Account</Button>
          <Button color="inherit" onClick={handleExplore}>Explore</Button>
          <Button color="inherit" onClick={handleChat}>Chat</Button>
          <Button color="inherit" onClick={handleCreatePost}>Create Post</Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ color: "text.primary" }}>
        {error && <Typography color="error">{error}</Typography>}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {posts.map((post) => (
            <Card 
              key={post.id} 
              sx={{ 
                backgroundColor: "background.paper", 
                color: "text.primary",
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
              onClick={() => handlePostClick(post.id)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
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
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default HomePage;
