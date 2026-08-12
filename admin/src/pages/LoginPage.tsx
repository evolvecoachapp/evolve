import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { status, error, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      // Error is stored on AuthContext for display.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={(event) => void onSubmit(event)}>
        <div className="brand login-brand">
          <span className="brand-mark">EV</span>
          <div>
            <strong>EVOLVE Admin</strong>
            <span>Production control plane</span>
          </div>
        </div>
        <h1>Sign in</h1>
        <p className="muted">Administrator accounts only. Superuser access is verified on the server.</p>
        {error ? (
          <div className="banner banner-error" role="alert">
            {error}
          </div>
        ) : null}
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting || status === "booting"}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
