"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TagDto } from "@/app/dtos/tagDto";
import { getAllTags } from "@/api/apiTagRoutes";
import { getUserByEmail } from "@/api/apiUserRoutes";

const CreatePostPage = () => {
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [tags, setTags] = useState<TagDto[]>([]);
  const [availableTags, setAvailableTags] = useState<TagDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<{ url: string; title: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await getAllTags();
        setAvailableTags(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    fetchTags();
  }, []);

  const addMediaItem = () => {
    setMediaItems([...mediaItems, { url: "", title: "" }]);
  };

  const updateMediaItem = (index: number, field: "url" | "title", value: string) => {
    const newMediaItems = [...mediaItems];
    newMediaItems[index] = { ...newMediaItems[index], [field]: value };
    setMediaItems(newMediaItems);
  };

  const removeMediaItem = (index: number) => {
    setMediaItems(mediaItems.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      getUserByEmail(userEmail).then(user => setUsername(user.username));
    }
  }, []);

  const handleTagToggle = (tag: TagDto) => {
    setTags(prev =>
      prev.some(t => t.id === tag.id)
        ? prev.filter(t => t.id !== tag.id)
        : [...prev, tag]
    );
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
      const user = await getUserByEmail(userEmail);
      setUsername(user.username);
      console.log(user.username);
      console.log(username);7
      const postData = {
        username,
        content,
        tags: tags.map((tag) => ({ name: tag.name })),
        creationDate: Date.now(),
        media: mediaItems
      };
      const postResponse = await fetch("http://localhost:8080/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
      if (!postResponse.ok) throw new Error("Failed to create post");
      router.push("/home");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-8">
      <form onSubmit={handleSubmit} className="card w-full max-w-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create a New Post</h2>
        {error && <div className="bg-red-600 text-white p-2 rounded mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 text-gray-900 font-semibold">Content</label>
          <textarea
            className="input min-h-[100px]"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            placeholder="What's on your mind?"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-900 font-semibold">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                type="button"
                key={tag.id}
                className={`px-3 py-1 rounded-full border text-sm font-semibold transition ${tags.some(t => t.id === tag.id) ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-primary-100'}`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-900 font-semibold">Media</label>
          <button type="button" className="btn btn-secondary mb-2" onClick={addMediaItem}>Add Media URL</button>
          {mediaItems.map((item, index) => (
            <div key={index} className="mb-2 p-3 rounded bg-gray-100 flex flex-col gap-2">
              <input
                className="input"
                placeholder="Media URL"
                value={item.url}
                onChange={e => updateMediaItem(index, "url", e.target.value)}
              />
              <input
                className="input"
                placeholder="Media Title"
                value={item.title}
                onChange={e => updateMediaItem(index, "title", e.target.value)}
              />
              <button type="button" className="btn btn-secondary bg-red-600 text-white hover:bg-red-700" onClick={() => removeMediaItem(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary w-full font-semibold mt-4">Create Post</button>
      </form>
    </div>
  );
};

export default CreatePostPage; 