'use client';
import { useEffect, useState } from "react";
import { PostDto } from "../dtos/postDto";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Card, Button, Alert, Badge, Navbar, Nav } from 'react-bootstrap';
import Post from "@/components/Post";
import { getAllPosts, getPostsByTags, deletePost } from "@/api/apiPostRoutes";

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
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: number; email: string; username: string; role: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {

    const role = localStorage.getItem('role');
    console.log(role);
    setUserRole(role);
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/tags/all");
        if (res.ok) {
          const data = await res.json();
          setTags(data);
        }
      } catch (err) {
        // Optionally handle error
      }
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

  // Add useEffect for user search
  useEffect(() => {
    const searchUsers = async () => {
      if (userSearch.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `http://localhost:8080/api/users/search/users?query=${encodeURIComponent(userSearch)}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Error searching users:", err);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [userSearch]);

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

  const handleUserClick = (userId: number) => {
    setUserSearch("");
    setShowResults(false);
    router.push(`/profile/${userId}`);
  };

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
    <div className="bg-dark min-vh-100">
      <Navbar bg="dark" variant="dark" expand="md" className="mb-4 shadow">
        <Container>
          <Navbar.Brand className="fw-bold">My App</Navbar.Brand>
          <Nav className="ms-auto d-flex align-items-center">
            <div className="position-relative me-3">
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid #444',
                  background: '#222',
                  color: '#fff',
                  width: '200px'
                }}
              />
              {showResults && searchResults.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#222',
                    border: '1px solid #444',
                    borderRadius: 4,
                    marginTop: 4,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000
                  }}
                >
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserClick(user.id)}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        color: '#fff',
                        borderBottom: '1px solid #444'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#222'}
                    >
                      <div style={{ fontWeight: 500 }}>{user.username}</div>
                      <div style={{ fontSize: '0.8em', color: '#aaa' }}>{user.email}</div>
                      <div style={{ fontSize: '0.8em', color: '#0dcaf0' }}>{user.role}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Nav.Link onClick={handleHome}>Home</Nav.Link>
            <Nav.Link onClick={() => router.push('/my-account')}>My Account</Nav.Link>
            <Nav.Link onClick={handleExplore}>Explore</Nav.Link>
            <Nav.Link onClick={handleChat}>Chat</Nav.Link>
            <Nav.Link onClick={handleNetwork}>Network</Nav.Link>
            <Button variant="outline-light" className="ms-2" onClick={handleCreatePost}>Create Post</Button>
          </Nav>
        </Container>
      </Navbar>
      <Container>
        <div className="d-flex">
          <div style={{ minWidth: 180, marginRight: 24 }}>
            <h5 style={{ color: "#fff" }}>Tags</h5>
            <input
              type="text"
              placeholder="Filter tags..."
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value)}
              style={{ width: '100%', marginBottom: 8, padding: 4, borderRadius: 4, border: '1px solid #444', background: '#222', color: '#fff' }}
            />
            <div>
              {paginatedTags.map(tag => (
                <div
                  key={tag.id}
                  style={{
                    cursor: "pointer",
                    background: selectedTags.includes(tag.name) ? "#0dcaf0" : "#222",
                    color: selectedTags.includes(tag.name) ? "#222" : "#fff",
                    borderRadius: 4,
                    padding: "6px 12px",
                    marginBottom: 6,
                    fontWeight: selectedTags.includes(tag.name) ? 700 : 400,
                  }}
                  onClick={() => handleTagClick(tag.name)}
                >
                  {tag.name}
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTagPage((prev) => Math.max(prev - 1, 1))}
                disabled={tagPage === 1}
              >
                Previous
              </Button>
              <span style={{ color: "#fff", fontSize: 12 }}>
                Page {tagPage} of {totalTagPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTagPage((prev) => Math.min(prev + 1, totalTagPages))}
                disabled={tagPage === totalTagPages}
              >
                Next
              </Button>
            </div>
            {selectedTags.length > 0 && (
              <Button
                variant="outline-light"
                size="sm"
                className="mt-2"
                onClick={() => setSelectedTags([])}
              >
                Clear Filter
              </Button>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div className="d-flex align-items-center mb-3">
              <label htmlFor="sortPosts" style={{ color: '#fff', marginRight: 8 }}>Sort by:</label>
              <select
                id="sortPosts"
                value={sortOption}
                onChange={e => setSortOption(e.target.value as 'date' | 'likes')}
                style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #444', background: '#222', color: '#fff' }}
              >
                <option value="date">Creation Date</option>
                <option value="likes">Likes</option>
              </select>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row className="g-4">
              {currentPosts.map((post) => (
                <Col key={post.id} md={12}>
                  <Post
                    post={post}
                    onDelete={userRole === 'ROLE_ADMIN' ? handleDeletePost : undefined}
                    onClick={handlePostClick}
                    showDelete={userRole === 'ROLE_ADMIN'}
                  />
                </Col>
              ))}
            </Row>
            <div className="d-flex justify-content-center align-items-center my-4">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span style={{ color: "#fff" }}>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                className="ms-2"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
