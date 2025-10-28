import { useState } from "react";
import { SlButton } from "@shoelace-style/shoelace/dist/react";
import SignupForm from "./SignupForm";
import "./style/auth.css";
import LoginForm from "./AuthForm";

export default function AuthPage() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="auth-container">
      {/* Left Section: Form area */}
      <div className="auth-left">
        <div className="auth-content">
          <div className="auth-header">
            <h1>SnapWise</h1>
            <p>
              {showSignup
                ? "Join SnapWise and manage your projects effortlessly."
                : "Sign in to access your workspace."}
            </p>
          </div>

          <div className="auth-form">
            {showSignup ? <SignupForm /> : <LoginForm />}
          </div>

          <div className="auth-toggle">
            {showSignup ? (
              <>
                <p>Already have an account?</p>
                <SlButton
                  variant="default"
                  outline
                  size="small"
                  onClick={() => setShowSignup(false)}
                >
                  Sign In
                </SlButton>
              </>
            ) : (
              <>
                <SlButton
                  variant="primary"
                  size="small"
                  onClick={() => setShowSignup(true)}
                >
                  Create Account
                </SlButton>
              </>
            )}
            <p className="auth-terms">
        By creating an account, you agree to our{" "}
        <a href="/terms" target="_blank" rel="noopener noreferrer">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>.
      </p>
          </div>
        </div>
      </div>

      {/* Right Section: Background Image */}
      <div className="auth-right">
        <img
          src="https://images.unsplash.com/photo-1520974735194-6c0a1b1a5a63?q=80&w=1600&auto=format&fit=crop"
          alt="SnapWise inspiration"
          className="auth-image"
        />
        <div className="auth-overlay"></div>
        <div className="auth-text">
          <h2>SnapWise</h2>
          <p>
            Capture, compare, and document your construction progress —
            powered by AI.
          </p>
        </div>
      </div>
    </div>
  );
}
