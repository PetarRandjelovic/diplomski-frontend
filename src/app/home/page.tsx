'use client';
import { useEffect, useState } from "react";
import { PostDto } from "../dtos/postDto";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Card, Button, Alert, Badge, Navbar, Nav } from 'react-bootstrap';

const HomePage = () => {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
        const token = localStorage.getItem("authToken");
        let url = "http://localhost:8080/api/posts/all";
        let options: any = {
          headers: { Authorization: `Bearer ${token}` },
        };
        if (selectedTags.length > 0) {
          url = `http://localhost:8080/api/posts/tags?${selectedTags.map(tag => `tags=${encodeURIComponent(tag)}`).join('&')}`;
        }
        const response = await fetch(url, options);
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data: PostDto[] = await response.json();
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
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handleTagClick = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  return (
    <div className="bg-dark min-vh-100">
      <Navbar bg="dark" variant="dark" expand="md" className="mb-4 shadow">
        <Container>
          <Navbar.Brand className="fw-bold">My App</Navbar.Brand>
          <Nav className="ms-auto">
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
            <div>
              {tags.map(tag => (
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
            {error && <Alert variant="danger">{error}</Alert>}
            <Row className="g-4">
              {currentPosts.map((post) => (
                <Col key={post.id} md={12}>
                  <Card bg="secondary" text="light" className="shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => handlePostClick(post.id)}>
                    <Card.Body>
                      <Card.Title>{post.content}</Card.Title>
                      <Card.Subtitle className="mb-2 text-light small">
                        Posted by: {post.userEmail} on {new Date(post.creationDate).toLocaleString()}
                      </Card.Subtitle>
                      <div className="mt-2">
                        {post.tags.map((tag) => (
                          <Badge bg="info" key={tag.id} className="me-2">{tag.name}</Badge>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
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
