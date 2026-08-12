import { useEffect, useState } from "react";

import { fetchDashboard } from "../api/admin";
import { PageState } from "../components/PageState";
import { AdminApiError, type AdminDashboardSummary } from "../types/admin";

export function DashboardPage() {
  const [data, setData] = useState<AdminDashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    fetchDashboard()
      .then((summary) => {
        setData(summary);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setData(null);
        setLoading(false);
        setError(
          caught instanceof AdminApiError
            ? caught.message
            : "Unable to load the dashboard.",
        );
      });
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
      </header>
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
      ) : null}
    </main>
  );
}
