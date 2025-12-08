import { useState } from "react";
import { apiClient } from "../lib/apiClient";
import "./LoginPage.css";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiClient.post("/api/auth/login", { email });
      setMessage({
        type: "success",
        text: "Check your email for a magic link to sign in!",
      });
      setEmail("");
    } catch (error) {
      console.error("Login error:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to send magic link. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome to BlueBloods NIL</h1>
          <p>Sign in with your email to access your athlete dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              disabled={loading}
              required
            />
          </div>

          {message && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-help-text">
            We'll send you a secure link to sign in. No password required.
          </p>
          <p className="login-help-text">
            Don't have an account? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
