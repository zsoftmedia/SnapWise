import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { SlInput, SlButton, SlIcon } from "@shoelace-style/shoelace/dist/react";
import "./style/auth-form.css";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Creating account...");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: fullName },
      },
    });

    if (error) setMsg(error.message);
    else setMsg("✅ Check your inbox to confirm your email.");
  }

  return (
    <form onSubmit={handleSignup} className="auth-form">
      <SlInput
        label="Full Name"
        placeholder="John Doe"
        clearable
        value={fullName}
        onSlInput={(e: any) => setFullName(e.target.value)}
        required
      >
        <SlIcon slot="prefix" name="person" />
      </SlInput>

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

      <SlButton variant="primary" type="submit" className="auth-btn">
        Create Account
      </SlButton>

      

      {msg && <p className="auth-msg">{msg}</p>}
    </form>
  );
}
