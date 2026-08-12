import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchUser, updateUserStatus } from "../api/admin";
import { useAuth } from "../auth/AuthContext";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { errorMessage, Field, formatDate } from "../components/Field";
import { FeedbackBanner } from "../components/FeedbackBanner";
import { PageHeader } from "../components/PageHeader";
import { PageState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import type { AdminUser } from "../types/admin";

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { admin } = useAuth();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

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
        setError(errorMessage(caught, "Unable to load this user."));
      });
  }

  useEffect(() => {
    load();
  }, [userId]);

  async function applyStatus() {
    if (!user) {
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const updated = await updateUserStatus(user.id, !user.is_active);
      setUser(updated);
      setConfirm(false);
      setNotice({
        tone: "success",
        message: updated.is_active ? "Account activated." : "Account deactivated.",
      });
    } catch (caught: unknown) {
      setNotice({
        tone: "error",
        message: errorMessage(caught, "Unable to update account status."),
      });
      setConfirm(false);
    } finally {
      setSaving(false);
    }
  }

  const isSelf = admin?.id === user?.id;
  const nextActive = user ? !user.is_active : false;

  return (
    <main className="page">
      <PageHeader
        eyebrow={<><Link to="/users">Users</Link> / Account</>}
        title={user?.username ?? "User"}
      >
        {user ? (
          <button
            type="button"
            className="btn btn-secondary"
            disabled={saving || isSelf}
            title={isSelf ? "You cannot deactivate your own account." : undefined}
            onClick={() => setConfirm(true)}
          >
            {user.is_active ? "Deactivate" : "Activate"}
          </button>
        ) : null}
      </PageHeader>
      {loading ? (
        <PageState kind="loading" title="Loading user" message="Fetching account details." />
      ) : null}
      {error && !user ? (
        <PageState kind="error" title="User unavailable" message={error} actionLabel="Retry" onAction={load} />
      ) : null}
      {notice ? <FeedbackBanner tone={notice.tone}>{notice.message}</FeedbackBanner> : null}
      {isSelf ? (
        <p className="readonly-note">You cannot deactivate your own administrator account.</p>
      ) : null}
      {!loading && user ? (
        <>
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
            <Field label="Goal" value={user.goal ?? "—"} />
            <Field label="Activity level" value={user.activity_level ?? "—"} />
            <Field label="Height" value={user.height_cm ? `${user.height_cm} cm` : "—"} />
            <Field label="Weight" value={user.current_weight_kg ? `${user.current_weight_kg} kg` : "—"} />
            <Field label="Created" value={formatDate(user.created_at)} />
            <Field label="Updated" value={formatDate(user.updated_at)} />
          </section>
          <section className="panel" aria-label="Related activity">
            <h2>Related activity</h2>
            <p className="muted">Read-only athlete records for this account.</p>
            <div className="header-actions">
              <Link className="btn btn-secondary" to={`/workout-logs?user=${user.id}`}>Workout logs</Link>
              <Link className="btn btn-secondary" to={`/nutrition?user=${user.id}`}>Nutrition</Link>
              <Link className="btn btn-secondary" to={`/goals?user=${user.id}`}>Goals</Link>
              <Link className="btn btn-secondary" to={`/coach?user=${user.id}`}>Coach</Link>
            </div>
          </section>
        </>
      ) : null}
      {confirm && user ? (
        <ConfirmDialog
          title={nextActive ? "Activate account" : "Deactivate account"}
          message={
            nextActive
              ? "This account will be able to sign in again."
              : "This account will no longer be able to sign in. This does not delete the user."
          }
          confirmLabel={nextActive ? "Activate" : "Deactivate"}
          busy={saving}
          onConfirm={() => void applyStatus()}
          onCancel={() => setConfirm(false)}
        />
      ) : null}
    </main>
  );
}
