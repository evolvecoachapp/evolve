import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchDashboard, fetchHealth, fetchUsers } from "../api/admin";
import { FeedbackBanner } from "../components/FeedbackBanner";
import { formatDate } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { PageState } from "../components/PageState";
import { healthTone, StatusBadge } from "../components/StatusBadge";
import {
  AdminApiError,
  type AdminDashboardSummary,
  type AdminSystemHealth,
  type AdminUser,
} from "../types/admin";

const QUICK_LINKS = [
  { to: "/users", label: "Users", hint: "Accounts and access" },
  { to: "/exercises", label: "Exercises", hint: "Catalog editor" },
  { to: "/programs", label: "Programs", hint: "Templates and publish" },
  { to: "/workout-logs", label: "Workout logs", hint: "Athlete sessions" },
  { to: "/nutrition", label: "Nutrition", hint: "Meals and logs" },
  { to: "/system", label: "System", hint: "API and database" },
];

export function DashboardPage() {
  const [data, setData] = useState<AdminDashboardSummary | null>(null);
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [secondaryError, setSecondaryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    setSecondaryError(null);
    Promise.allSettled([
      fetchDashboard(),
      fetchHealth(),
      fetchUsers({ limit: 8, offset: 0 }),
    ]).then(([dashboardResult, healthResult, usersResult]) => {
      setLoading(false);
      if (dashboardResult.status === "fulfilled") {
        setData(dashboardResult.value);
      } else {
        setData(null);
        const caught = dashboardResult.reason as unknown;
        setError(
          caught instanceof AdminApiError
            ? caught.message
            : "Unable to load the dashboard.",
        );
      }
      if (healthResult.status === "fulfilled") {
        setHealth(healthResult.value);
      } else {
        setHealth(null);
      }
      if (usersResult.status === "fulfilled") {
        setRecentUsers(usersResult.value.items);
      } else {
        setRecentUsers([]);
      }
      if (healthResult.status === "rejected" || usersResult.status === "rejected") {
        setSecondaryError("Some operational panels could not be loaded.");
      }
    });
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="page">
      <PageHeader eyebrow="Overview" title="Dashboard" />
      {loading ? (
        <PageState kind="loading" title="Loading dashboard" message="Fetching platform summary." />
      ) : null}
      {error ? (
        <PageState
          kind="error"
          title="Dashboard unavailable"
          message={error}
          actionLabel="Retry"
          onAction={load}
        />
      ) : null}
      {!loading && !error && data ? (
        <div className="dashboard-layout">
          {secondaryError ? <FeedbackBanner tone="error">{secondaryError}</FeedbackBanner> : null}
          <section className="stat-grid" aria-label="Platform summary">
            <article className="stat-card">
              <span>Total users</span>
              <strong>{data.users.total}</strong>
            </article>
            <article className="stat-card">
              <span>Active</span>
              <strong>{data.users.active}</strong>
            </article>
            <article className="stat-card">
              <span>Inactive</span>
              <strong>{data.users.inactive}</strong>
            </article>
            <article className="stat-card">
              <span>Superusers</span>
              <strong>{data.users.superusers}</strong>
            </article>
            <article className="stat-card">
              <span>Workout logs</span>
              <strong>{data.activity.workout_logs}</strong>
            </article>
            <article className="stat-card">
              <span>Meal logs</span>
              <strong>{data.activity.meal_logs}</strong>
            </article>
            <article className="stat-card">
              <span>Recovery check-ins</span>
              <strong>{data.activity.recovery_check_ins}</strong>
            </article>
            <article className="stat-card">
              <span>Goals</span>
              <strong>{data.activity.goals}</strong>
            </article>
            <article className="stat-card">
              <span>Progress entries</span>
              <strong>{data.activity.progress_entries}</strong>
            </article>
            <article className="stat-card">
              <span>Conversations</span>
              <strong>{data.activity.conversations}</strong>
            </article>
          </section>
          <div className="dashboard-split">
            <section className="panel" aria-label="Recent users">
              <h2>Recent users</h2>
              {recentUsers.length === 0 ? (
                <p className="muted">No accounts to show yet.</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Status</th>
                        <th>Role</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <Link to={`/users/${user.id}`}>{user.username}</Link>
                          </td>
                          <td>
                            <StatusBadge tone={user.is_active ? "success" : "danger"}>
                              {user.is_active ? "Active" : "Inactive"}
                            </StatusBadge>
                          </td>
                          <td>
                            <StatusBadge tone={user.is_superuser ? "warning" : "neutral"}>
                              {user.is_superuser ? "Superuser" : "User"}
                            </StatusBadge>
                          </td>
                          <td>{formatDate(user.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            <section className="panel health-card" aria-label="System status">
              <h2>System status</h2>
              {health ? (
                <>
                  <div className="detail-field">
                    <span>Overall</span>
                    <StatusBadge tone={healthTone(health.status)}>{health.status}</StatusBadge>
                  </div>
                  <div className="detail-field">
                    <span>API</span>
                    <StatusBadge tone={healthTone(health.api)}>{health.api}</StatusBadge>
                  </div>
                  <div className="detail-field">
                    <span>Database</span>
                    <StatusBadge tone={healthTone(health.database)}>{health.database}</StatusBadge>
                  </div>
                  <p className="muted">Version {health.version}</p>
                  <Link to="/system">Open system health</Link>
                </>
              ) : (
                <p className="muted">System health is unavailable.</p>
              )}
            </section>
          </div>
          <section className="panel" aria-label="Operational summary">
            <h2>Operational summary</h2>
            <p className="muted">
              {data.users.active} active of {data.users.total} accounts ·{" "}
              {data.activity.workout_logs} workout logs · {data.activity.meal_logs} meal logs ·{" "}
              {data.activity.conversations} coach conversations
            </p>
          </section>
          <section aria-label="Quick links">
            <div className="quick-links">
              {QUICK_LINKS.map((link) => (
                <Link key={link.to} className="quick-link" to={link.to}>
                  <strong>{link.label}</strong>
                  <span>{link.hint}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
