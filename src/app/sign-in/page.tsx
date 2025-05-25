'use client';
import { useState } from "react";
import { loginUser } from "@/services/auth";
import { useRouter } from "next/navigation";
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    try {
      const response = await loginUser(email, password);
      if (response) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userEmail', email);
        console.log(localStorage);
        router.push('/home');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSignUpRedirect = () => {
    router.push('/sign-up');
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-dark">
      <Container className="d-flex justify-content-center align-items-center">
        <Card bg="dark" text="light" style={{ minWidth: 400, width: '100%', maxWidth: 500 }} className="shadow p-4">
          <Card.Body>
            <h2 className="mb-4 text-center">Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </Form.Group>
              <Form.Group className="mb-4" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </Form.Group>
              <Button variant="primary" className="w-100 mb-2" onClick={handleLogin}>
                Login
              </Button>
              <Button variant="secondary" className="w-100" onClick={handleSignUpRedirect}>
                Create new account
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LoginPage;
