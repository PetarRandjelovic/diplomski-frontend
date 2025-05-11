"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Container, Box, Button, TextField, Chip } from "@mui/material";
import darkTheme from "@/themes/darkTheme";

const CreatePostPage = () => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      setError("You must be logged in to create a post.");
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:8080/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userEmail,
          content,
          tags: tags.map((tag) => ({ name: tag })),
          creationDate: Date.now(),
        }),
      });
      if (!response.ok) throw new Error("Failed to create post");
      router.push("/home");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My App
          </Typography>
          <Button color="inherit" onClick={() => router.push("/home")}>Home</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ color: "text.primary" }}>
        <Typography variant="h5" gutterBottom>
          Create a New Post
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TextField
              label="Add Tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              sx={{ mr: 2 }}
            />
            <Button variant="outlined" onClick={handleAddTag}>Add Tag</Button>
          </Box>
          <Box sx={{ mb: 2 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
          <Button type="submit" variant="contained" color="primary">
            Create Post
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default CreatePostPage; 