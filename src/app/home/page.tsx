'use client';
import { useEffect, useState } from "react";
import { PostDto } from "../dtos/postDto";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Card, Button, Alert, Badge, Navbar, Nav } from 'react-bootstrap';

const HomePage = () => {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:8080/api/posts/all", {
          headers: {
            Authorization: `Bearer ${token}`,
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

  const handleHome = () => router.push('/home');
  const handleMyAccount = () => router.push('/edit-account');
  const handleExplore = () => router.push('/explore');
  const handleChat = () => router.push('/chat');
  const handleCreatePost = () => router.push('/posts/create');
  const handlePostClick = (postId: number) => router.push(`/posts/${postId}`);

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
            <Button variant="outline-light" className="ms-2" onClick={handleCreatePost}>Create Post</Button>
          </Nav>
        </Container>
      </Navbar>
      <Container>
        {error && <Alert variant="danger">{error}</Alert>}
        <Row className="g-4">
          {posts.map((post) => (
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
      </Container>
    </div>
  );
};

export default HomePage;
