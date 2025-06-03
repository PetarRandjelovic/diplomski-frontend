'use client';
import React, { useEffect, useState } from 'react';
import { getUserByEmail, updateUser, getUserFriendsCount } from "@/api/apiUserRoutes";
import { Card, Form, Button, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';

interface UserDto {
  id: number;
  dateOfBirth: number;
  email: string;
  username: string;
  role: string;
}

const MyAccount: React.FC = () => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [friendsCount, setFriendsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
   
        const fetchUserData = async () => {
            try {
                const email = localStorage.getItem('userEmail');
                if (!email) {
                    throw new Error('User email not found');
                }
                const userData = (await getUserByEmail(email)) as UserDto;
                setUser(userData);
                setNewUsername(userData.username);
                const friends = await getUserFriendsCount(email);
                setFriendsCount(Number(friends));
            } catch (err) {
                setError('Failed to load user data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            setLoading(true);
            const updatedUser = await updateUser({ ...user, username: newUsername });
            setUser(updatedUser);
            setError(null);
        } catch (err) {
            setError('Failed to update username');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
                <Spinner animation="border" variant="light" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
            <Card bg="dark" text="light" style={{ minWidth: 400, width: '100%', maxWidth: 600 }} className="shadow p-4">
                <Card.Body>
                    <h2 className="mb-4 text-center">My Account</h2>
                    <Form onSubmit={handleUpdateUsername}>
                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" value={user?.email || ''} disabled readOnly />
                        </Form.Group>
                        <Form.Group className="mb-4" controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading || !newUsername.trim()}>
                            Update Username
                        </Button>
                    </Form>
                    <Row className="mt-4 text-center">
                        <Col>
                            <div className="bg-secondary rounded p-2">
                                <div className="fw-bold">Friends</div>
                                <div className="display-6">{friendsCount}</div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default MyAccount; 