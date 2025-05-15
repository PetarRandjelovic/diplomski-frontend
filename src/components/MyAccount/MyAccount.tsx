import React, { useEffect, useState } from 'react';
import { userService, UserDto, UserRelationshipDto } from '../../services/userService/userService';
import { Card, Form, Button, Spinner, Alert, Container, Row, Col, Modal, ListGroup } from 'react-bootstrap';

const MyAccount: React.FC = () => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [userList, setUserList] = useState<UserRelationshipDto[]>([]);
    const [listLoading, setListLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const email = localStorage.getItem('userEmail');
                if (!email) {
                    throw new Error('User email not found');
                }
                const userData = await userService.getUserByEmail(email);
                setUser(userData);
                setNewUsername(userData.username);
                const followers = await userService.getFollowerCount(email);
                const following = await userService.getFollowingCount(email);
                setFollowerCount(followers);
                setFollowingCount(following);
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
            const updatedUser = await userService.updateUsername({
                ...user,
                username: newUsername
            });
            setUser(updatedUser);
            setError(null);
        } catch (err) {
            setError('Failed to update username');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleShowFollowers = async () => {
        if (!user) return;
        setModalTitle('Followers');
        setShowModal(true);
        setListLoading(true);
        try {
            const list = await userService.getFollowersList(user.email);
            setUserList(list);
        } catch (err) {
            setUserList([]);
        } finally {
            setListLoading(false);
        }
    };

    const handleShowFollowing = async () => {
        if (!user) return;
        setModalTitle('Following');
        setShowModal(true);
        setListLoading(true);
        try {
            const list = await userService.getFollowingList(user.email);
            setUserList(list);
        } catch (err) {
            setUserList([]);
        } finally {
            setListLoading(false);
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
                            <div className="bg-secondary rounded p-2" style={{cursor:'pointer'}} onClick={handleShowFollowers}>
                                <div className="fw-bold">Followers</div>
                                <div className="display-6">{followerCount}</div>
                            </div>
                        </Col>
                        <Col>
                            <div className="bg-secondary rounded p-2" style={{cursor:'pointer'}} onClick={handleShowFollowing}>
                                <div className="fw-bold">Following</div>
                                <div className="display-6">{followingCount}</div>
                            </div>
                        </Col>
                    </Row>
                    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{modalTitle}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {listLoading ? (
                                <div className="text-center"><Spinner animation="border" /></div>
                            ) : userList.length === 0 ? (
                                <div className="text-center text-muted">No users found.</div>
                            ) : (
                                <ListGroup variant="flush">
                                    {userList.map((rel) => (
                                        <ListGroup.Item key={rel.id}>
                                            {modalTitle === 'Followers' ? rel.email : rel.followedEmail}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Modal.Body>
                    </Modal>
                </Card.Body>
            </Card>
        </div>
    );
};

export default MyAccount; 