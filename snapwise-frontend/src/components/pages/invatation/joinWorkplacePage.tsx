import React, { useEffect, useState } from "react";
import {
  SlButton,
  SlCard,
  SlIcon,
  SlSpinner,
  SlAlert,
} from "@shoelace-style/shoelace/dist/react";
import { supabase } from "../../../lib/supabase";

const API_BASE = process.env.REACT_APP_API_URL|| "http://localhost:4000/api";

interface InviteData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  workplaces: { name: string } | null;
}

export default function JoinWorkplacePage() {
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const token = new URLSearchParams(window.location.search).get("token");

  // ✅ Fetch invite info from backend
  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/workplaces/invite/${token}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Invalid invite");
        setInvite(data.invite);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // ✅ Accept invitation
  async function handleJoin() {
    try {
      setJoining(true);
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        alert("Please sign up or log in first to continue.");
        window.location.href = "/login"; // adjust your login path
        return;
      }

      const res = await fetch(`${API_BASE}/workplaces/invite/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, user_id: user.id }),
      });

      const result = await res.json();
      if (!result.ok) throw new Error(result.error);

      setJoined(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="join-center">
        <SlSpinner /> Verifying your invitation...
      </div>
    );
  }

  if (error) {
    return (
      <div className="join-center">
        <SlAlert variant="danger" open>
          <strong>Error:</strong> {error}
        </SlAlert>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="join-center">
        <SlCard className="join-card">
          <SlIcon name="check-circle" style={{ color: "green", fontSize: "2rem" }} />
          <h3>Welcome aboard 🎉</h3>
          <p>You’ve successfully joined <strong>{invite?.workplaces?.name}</strong>.</p>
          <SlButton href="/" variant="primary">
            Go to Dashboard
          </SlButton>
        </SlCard>
      </div>
    );
  }

  return (
    <div className="join-center">
      <SlCard className="join-card">
        <SlIcon name="person-plus" style={{ fontSize: "2rem", color: "#2563eb" }} />
        <h3>Join {invite?.workplaces?.name}</h3>
        <p>
          You’ve been invited by your team to join as a <strong>{invite?.role}</strong>.
        </p>

        <div className="join-info">
          <div>
            <strong>Name:</strong> {invite?.full_name}
          </div>
          <div>
            <strong>Email:</strong> {invite?.email}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <span style={{ color: invite?.status === "invited" ? "#f97316" : "#16a34a" }}>
              {invite?.status}
            </span>
          </div>
        </div>

        <SlButton
          variant="primary"
          loading={joining}
          onClick={handleJoin}
          style={{ marginTop: "1rem", width: "100%" }}
        >
          <SlIcon name="check2-circle" /> Join Workplace
        </SlButton>
      </SlCard>
    </div>
  );
}
