'use client';
import { useEffect, useState } from "react";
import { PostDto } from "../dtos/postDto";
import { useRouter } from "next/navigation";
import Post from "@/components/Post";
import { getAllPosts, getPostsByTags, deletePost } from "@/api/apiPostRoutes";
import { getAllTags } from "@/api/apiTagRoutes";

const HomePage = () => {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagPage, setTagPage] = useState(1);
  const tagsPerPage = 10;
  const [tagFilter, setTagFilter] = useState("");
  const [sortOption, setSortOption] = useState<'date' | 'likes'>('date');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await getAllTags();
        setTags(data);
      } catch (err) {}
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let data: PostDto[];
        if (selectedTags.length > 0) {
          data = await getPostsByTags(selectedTags) as PostDto[];
        } else {
          data = await getAllPosts() as PostDto[];
        }
        setPosts(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    fetchPosts();
  }, [selectedTags]);

  const handleHome = () => router.push('/home');
  const handleMyAccount = () => router.push('/edit-account');
  const handleExplore = () => router.push('/explore');
  const handleChat = () => router.push('/chat');
  const handleNetwork = () => router.push('/network');
  const handleCreatePost = () => router.push('/posts/create');
  const handlePostClick = (postId: number) => router.push(`/posts/${postId}`);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  // Sort posts based on sortOption
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortOption === 'date') {
      return b.creationDate - a.creationDate;
    } else {
      return b.likes - a.likes;
    }
  });
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handleTagClick = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]

    );
  };

  // Filter tags before paginating
  const filteredTags = tags.filter(tag => tag.name.toLowerCase().includes(tagFilter.toLowerCase()));
  const totalTagPages = Math.ceil(filteredTags.length / tagsPerPage);
  const paginatedTags = filteredTags.slice((tagPage - 1) * tagsPerPage, tagPage * tagsPerPage);

  // Reset tag page when filter changes
  useEffect(() => {
    setTagPage(1);
  }, [tagFilter]);

  const handleDeletePost = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="min-w-[180px] md:mr-6 mb-6 md:mb-0">
            <h5 className="text-lg font-semibold mb-2">Tags</h5>
            <input
              type="text"
              placeholder="Filter tags..."
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value)}
              className="input mb-2 text-gray-900 placeholder-gray-700"
            />
            <div className="space-y-2">
              {paginatedTags.map(tag => (
                <div
                  key={tag.id}
                  className={`cursor-pointer ${selectedTags.includes(tag.name) ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'} px-2 py-1 rounded`}
                  onClick={() => handleTagClick(tag.name)}
                >
                  {tag.name}
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <button
                className="text-gray-300 text-sm"
                onClick={() => setTagPage((prev) => Math.max(prev - 1, 1))}
                disabled={tagPage === 1}
              >
                Previous
              </button>
              <span className="text-gray-300 text-sm">
                Page {tagPage} of {totalTagPages}
              </span>
              <button
                className="text-gray-300 text-sm"
                onClick={() => setTagPage((prev) => Math.min(prev + 1, totalTagPages))}
                disabled={tagPage === totalTagPages}
              >
                Next
              </button>
            </div>
            {selectedTags.length > 0 && (
              <button
                className="text-gray-300 text-sm mt-2"
                onClick={() => setSelectedTags([])}
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="flex-1">
            <div className="d-flex align-items-center mb-3">
              <label htmlFor="sortPosts" className="text-gray-300 mr-2">Sort by:</label>
              <select
                id="sortPosts"
                value={sortOption}
                onChange={e => setSortOption(e.target.value as 'date' | 'likes')}
                className="text-gray-900 p-2 rounded bg-white w-48 text-base"
              >
                <option value="date">Creation Date</option>
                <option value="likes">Likes</option>
              </select>
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="flex flex-col gap-4">
              {currentPosts.map((post) => (
                <div key={post.id}>
                  <Post
                    post={post}
                    onDelete={userRole === 'ROLE_ADMIN' ? handleDeletePost : undefined}
                    onClick={handlePostClick}
                    showDelete={userRole === 'ROLE_ADMIN'}
                    showLikes={true}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center my-4 gap-2">
              <button
                className="text-gray-300 mr-2"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="text-gray-300 ms-2"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
