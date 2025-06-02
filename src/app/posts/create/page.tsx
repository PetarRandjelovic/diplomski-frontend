"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Container, Box, Button, TextField, Chip, Autocomplete } from "@mui/material";
import darkTheme from "@/themes/darkTheme";
import { TagDto } from "@/app/dtos/tagDto";
import { MediaDto } from "@/app/dtos/mediaDto";

const CreatePostPage = () => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<TagDto[]>([]);
  const [availableTags, setAvailableTags] = useState<TagDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaTitles, setMediaTitles] = useState<{ [key: string]: string }>({});
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

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setMediaFiles(prev => [...prev, ...newFiles]);
      newFiles.forEach(file => {
        setMediaTitles(prev => ({
          ...prev,
          [file.name]: file.name
        }));
      });
    }
  };

  const handleMediaTitleChange = (fileName: string, title: string) => {
    setMediaTitles(prev => ({
      ...prev,
      [fileName]: title
    }));
  };

  const removeMedia = (fileName: string) => {
    setMediaFiles(prev => prev.filter(file => file.name !== fileName));
    setMediaTitles(prev => {
      const newTitles = { ...prev };
      delete newTitles[fileName];
      return newTitles;
    });
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
      
      // First create the post
      const postResponse = await fetch("http://localhost:8080/api/posts/create", {
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

      if (!postResponse.ok) throw new Error("Failed to create post");
      const postData = await postResponse.json();

      // Then upload media files if any
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('postId', postData.id.toString());
          formData.append('title', mediaTitles[file.name] || file.name);

          const mediaResponse = await fetch("http://localhost:8080/api/media/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!mediaResponse.ok) throw new Error("Failed to upload media");
        }
      }

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
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="media-upload"
              type="file"
              multiple
              onChange={handleMediaUpload}
            />
            <label htmlFor="media-upload">
              <Button variant="outlined" component="span" sx={{ mb: 2 }}>
                Upload Media
              </Button>
            </label>
            
            {mediaFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {mediaFiles.map((file) => (
                  <Box key={file.name} sx={{ mb: 2, p: 2, border: '1px solid rgba(255, 255, 255, 0.23)', borderRadius: 1 }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '8px' }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Media Title"
                      value={mediaTitles[file.name] || ''}
                      onChange={(e) => handleMediaTitleChange(file.name, e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => removeMedia(file.name)}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

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
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Create Post
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default CreatePostPage; 