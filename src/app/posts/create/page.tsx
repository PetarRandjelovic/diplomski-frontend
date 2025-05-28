"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Container, Box, Button, TextField, Chip, Autocomplete } from "@mui/material";
import darkTheme from "@/themes/darkTheme";
import { TagDto } from "@/app/dtos/tagDto";

const CreatePostPage = () => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<TagDto[]>([]);
  const [availableTags, setAvailableTags] = useState<TagDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/tags/all");
        if (!response.ok) throw new Error("Failed to fetch tags");
        const data = await response.json();
        setAvailableTags(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    fetchTags();
  }, []);

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
          tags: tags.map((tag) => ({ id: tag.id, name: tag.name })),
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
          <Box sx={{ mb: 2 }}>
            <Autocomplete
              multiple
              id="tags"
              options={availableTags}
              getOptionLabel={(option) => option.name}
              value={tags}
              onChange={(_, newValue) => setTags(newValue)}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter((option) =>
                  option.name.toLowerCase().includes(searchTerm)
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Search and select tags..."
                  helperText="Type to search for tags"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...chipProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={option.name}
                      {...chipProps}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  );
                })
              }
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <li key={key} {...rest}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>{option.name}</Typography>
                    </Box>
                  </li>
                );
              }}
              sx={{
                '& .MuiAutocomplete-input': {
                  color: 'text.primary',
                },
                '& .MuiInputLabel-root': {
                  color: 'text.primary',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            />
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