import { useEffect, useState } from "react";

import { fetchHealth } from "../api/admin";
import { PageState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { AdminApiError, type AdminSystemHealth } from "../types/admin";

export function SystemPage() {
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    fetchHealth()
      .then((snapshot) => {
        setHealth(snapshot);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setHealth(null);
        setLoading(false);
        setError(
          caught instanceof AdminApiError
            ? caught.message
            : "Unable to load system health.",
        );
      });
  }

  useEffect(() => {
    load();
  }, []);

  const tone =
    health?.status === "ok" ? "success" : health?.status === "degraded" ? "warning" : "danger";

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>System health</h1>
        </div>
        <button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>
          Refresh
        </button>
      </header>
      {loading ? (
        <PageState kind="loading" title="Checking system" message="Pinging API and database status." />
      ) : null}
      {error ? (
        <PageState kind="error" title="Health unavailable" message={error} actionLabel="Retry" onAction={load} />
      ) : null}
      {!loading && !error && health ? (
        <section className="detail-grid">
          <div className="detail-field">
            <span>Overall</span>
            <StatusBadge tone={tone}>{health.status}</StatusBadge>
          </div>
          <div className="detail-field">
            <span>API</span>
            <strong>{health.api}</strong>
          </div>
          <div className="detail-field">
            <span>Database</span>
            <strong>{health.database}</strong>
          </div>
          <div className="detail-field">
            <span>Version</span>
            <strong>{health.version}</strong>
          </div>
        </section>
      ) : null}
    </main>
  );
}
