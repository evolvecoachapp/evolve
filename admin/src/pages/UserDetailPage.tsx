import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchUser, updateUserStatus } from "../api/admin";
import { useAuth } from "../auth/AuthContext";
import { PageState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { AdminApiError, type AdminUser } from "../types/admin";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { admin } = useAuth();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    if (!userId) {
      return;
    }
    setLoading(true);
    setError(null);
    fetchUser(userId)
      .then((record) => {
        setUser(record);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setUser(null);
        setLoading(false);
        setError(
          caught instanceof AdminApiError ? caught.message : "Unable to load this user.",
        );
      });
  }

  useEffect(() => {
    load();
  }, [userId]);

  async function toggleStatus() {
    if (!user) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateUserStatus(user.id, !user.is_active);
      setUser(updated);
    } catch (caught: unknown) {
      setError(
        caught instanceof AdminApiError ? caught.message : "Unable to update account status.",
      );
    } finally {
      setSaving(false);
    }
  }

  const isSelf = admin?.id === user?.id;

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <Link to="/users">Users</Link> / Account
          </p>
          <h1>{user?.username ?? "User"}</h1>
        </div>
        {user ? (
          <button
            type="button"
            className="btn btn-secondary"
            disabled={saving || isSelf}
            onClick={() => void toggleStatus()}
          >
            {user.is_active ? "Deactivate" : "Activate"}
          </button>
        ) : null}
      </header>
      {loading ? (
        <PageState kind="loading" title="Loading user" message="Fetching account details." />
      ) : null}
      {error && !user ? (
        <PageState kind="error" title="User unavailable" message={error} actionLabel="Retry" onAction={load} />
      ) : null}
      {error && user ? (
        <div className="banner banner-error" role="alert">
          {error}
        </div>
      ) : null}
      {!loading && user ? (
        <section className="detail-grid">
          <Field label="Email" value={user.email} />
          <Field label="Username" value={user.username} />
          <Field
            label="Name"
            value={[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
          />
          <div className="detail-field">
            <span>Status</span>
            <StatusBadge tone={user.is_active ? "success" : "danger"}>
              {user.is_active ? "Active" : "Inactive"}
            </StatusBadge>
          </div>
          <div className="detail-field">
            <span>Role</span>
            <StatusBadge tone={user.is_superuser ? "warning" : "neutral"}>
              {user.is_superuser ? "Superuser" : "User"}
            </StatusBadge>
          </div>
          <Field label="Verified" value={user.is_verified ? "Yes" : "No"} />
          <Field label="Created" value={new Date(user.created_at).toLocaleString()} />
          <Field label="Updated" value={new Date(user.updated_at).toLocaleString()} />
        </section>
      ) : null}
    </main>
  );
}
