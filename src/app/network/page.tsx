"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRecommendations } from "@/api/apiUserRoutes";
import {
  getRelationshipStatus,
  getIncomingFriendRequests,
  sendFriendRequest,
  answerFriendRequest,
  UserRelationshipRecord,
} from "@/api/apiRelationRoutes";
import { UserDto } from "@/app/dtos/userDto";

type RelationshipStatus = 'CONFIRMED' | 'DECLINED' | 'WAITING' | 'NEUTRAL' | null;

export default function NetworkPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [relationshipStatuses, setRelationshipStatuses] = useState<Record<string, RelationshipStatus>>({});
  const [incomingRequests, setIncomingRequests] = useState<UserRelationshipRecord[]>([]);
  const router = useRouter();

  useEffect(() => {
    console.log('localStorage', localStorage);
    const fetchUsers = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) throw new Error("Not logged in");
        const data = await getRecommendations(userEmail);
        setUsers(data);
        // Fetch relationship status for each user
        const statuses: Record<string, RelationshipStatus> = {};
        for (const user of data) {
          const record = await getRelationshipStatus(userEmail, user.email);
          statuses[user.email] = record.status as RelationshipStatus;
        }
        setRelationshipStatuses(statuses);
      } catch (err) {
        setError("Could not load recommended users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch incoming friend requests
  useEffect(() => {
    const fetchIncomingRequests = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return;
      try {
        const data = await getIncomingFriendRequests(userEmail);
        setIncomingRequests(data);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchIncomingRequests();
  }, []);

  const handleSendRequest = async (user: UserDto) => {
    setRequesting(user.id);
    setSuccess(null);
    try {
      const myEmail = localStorage.getItem("userEmail");
      if (!myEmail) throw new Error("Not logged in");
      await sendFriendRequest(myEmail, user.email);
      setSuccess(`Friend request sent to ${user.username}`);
      setRelationshipStatuses(prev => ({
        ...prev,
        [user.email]: 'WAITING',
      }));
    } catch (err) {
      setError("Failed to send friend request.");
    } finally {
      setRequesting(null);
    }
  };

  const handleViewProfile = (user: UserDto) => {
    router.push(`/profile/${user.id}`);
  };

  const getButtonText = (user: UserDto) => {
    const status = relationshipStatuses[user.email];
    if (requesting === user.id) return "Sending...";
    if (status === 'WAITING') return "Request Sent";
    if (status === 'CONFIRMED') return "Friends";
    if (status === 'DECLINED' || status === 'NEUTRAL' || !status) return "Add Friend";
    return "Add Friend";
  };

  const isButtonDisabled = (user: UserDto) => {
    const status = relationshipStatuses[user.email];
    return requesting === user.id || status === 'WAITING' || status === 'CONFIRMED';
  };

  const handleAnswerRequest = async (emailSender: string, emailReceiver: string, status: boolean) => {
    try {
      console.log(localStorage.getItem("authToken"))
      await answerFriendRequest(emailSender, emailReceiver, status);
      setIncomingRequests((prev) =>
        prev.filter((req) => !(req.user1 === emailSender && req.user2 === emailReceiver))
      );
      // Optionally, refresh relationshipStatuses here
    } catch (err) {
      // handle error
    }
  };

  if (loading)
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
        Loading...
      </div>
    );
  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: 40 }}>
        {error}
      </div>
    );

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", color: "#fff" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Find New Friends</h2>
      {success && (
        <div style={{ color: "green", textAlign: "center", marginBottom: 16 }}>
          {success}
        </div>
      )}
      {incomingRequests.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3>Friend Requests</h3>
          {incomingRequests.map((req) => (
            <div key={req.user1} style={{ background: "#333", padding: 16, borderRadius: 8, marginBottom: 12 }}>
              <span style={{ marginRight: 16 }}>{req.user1} sent you a friend request.</span>
              <button
                style={{ marginRight: 8, background: "#28a745", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px" }}
                onClick={() => handleAnswerRequest(req.user1, req.user2, true)}
              >
                Accept
              </button>
              <button
                style={{ background: "#dc3545", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px" }}
                onClick={() => handleAnswerRequest(req.user1, req.user2, false)}
              >
                Decline
              </button>
            </div>
          ))}
        </div>
      )}
      <div>
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              background: "#444",
              borderRadius: 8,
              padding: 20,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{ cursor: "pointer" }}
              onClick={() => handleViewProfile(user)}
            >
              <div style={{ fontWeight: 600 }}>{user.username}</div>
              <div style={{ color: "#bbb", fontSize: 14 }}>{user.email}</div>
            </div>
            <button
              style={{
                background: relationshipStatuses[user.email] === 'WAITING' ? '#666' : '#0070f3',
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "8px 16px",
                cursor: isButtonDisabled(user) ? "default" : "pointer",
                fontWeight: 500,
                fontSize: 16,
                opacity: isButtonDisabled(user) ? 0.6 : 1,
              }}
              disabled={isButtonDisabled(user)}
              onClick={() => handleSendRequest(user)}
            >
              {getButtonText(user)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 