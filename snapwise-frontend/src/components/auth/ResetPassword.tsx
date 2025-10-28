import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlInput, SlButton, SlIcon } from "@shoelace-style/shoelace/dist/react";
import "./style/auth-form.css";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("Verifying link...");
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // When user clicks email link → Supabase sends access token in URL
    async function handleRecovery() {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace("#", "?"));
      const type = params.get("type");
      const access_token = params.get("access_token");

      if (type === "recovery" && access_token) {
        // Set temporary session so we can change password
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token: params.get("refresh_token") || "",
        });
        if (error) {
          setMsg(error.message);
        } else {
          setMsg("");
          setReady(true);
        }
      } else {
        setMsg("Invalid or expired reset link.");
      }
    }
    handleRecovery();
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Updating password...");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMsg(error.message);
    } else {
      setMsg("✅ Password updated! Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    }
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h2 className="auth-form-title">Reset your password</h2>

        {!ready ? (
          <p className="auth-msg">{msg}</p>
        ) : (
          <form onSubmit={handleReset} className="auth-form">
            <SlInput
              label="New Password"
              type="password"
              placeholder="••••••••"
              clearable
              value={password}
              onSlInput={(e: any) => setPassword(e.target.value)}
              required
            >
              <SlIcon slot="prefix" name="lock" />
            </SlInput>

            <SlButton variant="primary" type="submit" className="auth-btn">
              Save New Password
            </SlButton>
          </form>
        )}

        {msg && ready && <p className="auth-msg">{msg}</p>}
      </div>
    </div>
  );
}
