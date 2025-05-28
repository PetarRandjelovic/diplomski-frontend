"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserDto {
  id: number;
  dateOfBirth: number;
  email: string;
  username: string;
  role: string;
}

type RelationshipStatus = 'CONFIRMED' | 'DECLINED' | 'WAITING' | 'NEUTRAL' | null;

interface UserRelationshipRecord {
  user1: string;
  user2: string;
  status: RelationshipStatus;
}

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
        
        const res = await fetch(`http://localhost:8080/api/users/recommended/${userEmail}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch recommended users");
        const data = await res.json();
        setUsers(data);

        // Fetch relationship status for each user
        const statuses: Record<string, RelationshipStatus> = {};
        for (const user of data) {
          const statusRes = await fetch(
            `http://localhost:8080/api/relation/relationship-status/${userEmail}/${user.email}`,
            {
              headers: { "Content-Type": "application/json" },
            }
          );
          if (statusRes.ok) {
            const record: UserRelationshipRecord = await statusRes.json();
            statuses[user.email] = record.status;
          }
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
        const res = await fetch(`http://localhost:8080/api/relation/incoming/${userEmail}`);
        if (res.ok) {
          const data: UserRelationshipRecord[] = await res.json();
          setIncomingRequests(data);
        }
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
      const payload = {
        emailSender: myEmail,
        emailReceiver: user.email,
      };
      const res = await fetch(
        "http://localhost:8080/api/relation/create-request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to send request");
      setSuccess(`Friend request sent to ${user.username}`);
      // Update relationship status after sending request
      setRelationshipStatuses(prev => ({
        ...prev,
        [user.email]: 'WAITING'
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
      const res = await fetch("http://localhost:8080/api/relation/confirm-decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailSender, emailReceiver, status }),
      });
      if (res.ok) {
        setIncomingRequests((prev) =>
          prev.filter((req) => !(req.user1 === emailSender && req.user2 === emailReceiver))
        );
        // Optionally, refresh relationshipStatuses here
      }
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