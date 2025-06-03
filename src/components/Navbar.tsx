"use client";
import { useRouter } from "next/navigation";
import { Navbar as BSNavbar, Nav, Container } from "react-bootstrap";

const Navbar = () => {
  const router = useRouter();

  return (
    <BSNavbar bg="dark" variant="dark" expand="md" className="mb-4 shadow">
      <Container>
        <BSNavbar.Brand className="fw-bold" onClick={() => router.push('/home')} style={{ cursor: 'pointer' }}>
          My App
        </BSNavbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link onClick={() => router.push('/home')}>Home</Nav.Link>
          <Nav.Link onClick={() => router.push('/my-account')}>My Account</Nav.Link>
          <Nav.Link onClick={() => router.push('/group-chat')}>Group chat</Nav.Link>
          <Nav.Link onClick={() => router.push('/chat')}>Chat</Nav.Link>
          <Nav.Link onClick={() => router.push('/network')}>Network</Nav.Link>
        </Nav>
      </Container>
    </BSNavbar>
  );
};

export default Navbar; 