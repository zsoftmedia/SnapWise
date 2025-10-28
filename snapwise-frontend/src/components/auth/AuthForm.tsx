import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  SlInput,
  SlButton,
  SlIcon,
  SlDialog,
} from "@shoelace-style/shoelace/dist/react";
import "./style/auth-form.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const navigate = useNavigate();

  // Normal login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Signing in...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setMsg(error.message);
    else if (data?.session) {
      setMsg("Welcome back!");
      setTimeout(() => navigate("/master", { replace: true }), 800);
    } else setMsg("Please confirm your email before logging in.");
  }

  // Forgot password dialog handler
  async function handleForgotPassword() {
    if (!resetEmail) {
      setResetMsg("Please enter your email.");
      return;
    }

    // Send reset email — but stay in the same page!
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    if (error) setResetMsg(error.message);
    else {
      setResetMsg("📧 Reset link sent! Check your inbox.");
      // Keep dialog open so user sees the success message
    }
  }

  return (
    <>
      <form onSubmit={handleLogin} className="auth-form">
        <SlInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          clearable
          value={email}
          onSlInput={(e: any) => setEmail(e.target.value)}
          required
        >
          <SlIcon slot="prefix" name="envelope" />
        </SlInput>

        <SlInput
          label="Password"
          type="password"
          placeholder="••••••••"
          clearable
          value={password}
          onSlInput={(e: any) => setPass(e.target.value)}
          required
        >
          <SlIcon slot="prefix" name="lock" />
        </SlInput>

        {/* Forgot Password link opens dialog */}
        <div className="auth-links">
          <button
            type="button"
            className="forgot-link"
            onClick={() => setDialogOpen(true)}
          >
            Forgot password?
          </button>
        </div>

        <SlButton variant="primary" type="submit" className="auth-btn">
          Sign In
        </SlButton>

        {msg && <p className="auth-msg">{msg}</p>}
      </form>

      {/* Password Reset Dialog */}
      <SlDialog
        label="Reset your password"
        open={dialogOpen}
        onSlAfterHide={() => setDialogOpen(false)}
      >
        <p className="dialog-text">
          Enter your account email below. We’ll send you a link to reset your
          password.
        </p>

        <SlInput
          type="email"
          placeholder="you@example.com"
          value={resetEmail}
          onSlInput={(e: any) => setResetEmail(e.target.value)}
          required
        >
          <SlIcon slot="prefix" name="envelope" />
        </SlInput>

        {resetMsg && <p className="dialog-msg">{resetMsg}</p>}

        <div className="dialog-actions">
          <SlButton
            variant="default"
            outline
            onClick={() => {
              setDialogOpen(false);
              setResetEmail("");
              setResetMsg("");
            }}
          >
            Close
          </SlButton>
          <SlButton variant="primary" onClick={handleForgotPassword}>
            Send Reset Link
          </SlButton>
        </div>
      </SlDialog>
    </>
  );
}
