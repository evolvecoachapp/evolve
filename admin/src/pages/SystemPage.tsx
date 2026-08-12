import { useEffect, useState } from "react";

import { fetchHealth } from "../api/admin";
import { errorMessage } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { PageState } from "../components/PageState";
import { healthTone, StatusBadge } from "../components/StatusBadge";
import type { AdminSystemHealth } from "../types/admin";

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
        setError(errorMessage(caught, "Unable to load system health."));
      });
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="page">
      <PageHeader eyebrow="Operations" title="System">
        <button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>
          {loading ? "Checking…" : "Refresh"}
        </button>
      </PageHeader>
      {loading ? (
        <PageState kind="loading" title="Checking system" message="Pinging API and database status." />
      ) : null}
      {error ? (
        <PageState kind="error" title="Health unavailable" message={error} actionLabel="Retry" onAction={load} />
      ) : null}
      {!loading && !error && health ? (
        <>
          <section className="detail-grid" aria-label="System health">
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
            <div className="detail-field">
              <span>Version</span>
              <strong>{health.version}</strong>
            </div>
          </section>
          <section className="panel">
            <h2>Operational notes</h2>
            <p className="muted">
              {health.status === "ok"
                ? "API and database are responding. No operational errors were reported."
                : "The control plane is degraded. Database connectivity failed; the API process is still reachable."}
            </p>
            <p className="muted">
              Health responses never include JWT secrets, password hashes, API keys, tokens, or stack traces.
            </p>
          </section>
        </>
      ) : null}
    </main>
  );
}
