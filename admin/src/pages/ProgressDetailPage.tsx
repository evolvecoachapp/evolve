import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchProgressEntry } from "../api/admin";
import { errorMessage, Field, formatDay } from "../components/Field";
import { PageState } from "../components/PageState";
import type { ProgressEntry } from "../types/admin";

export function ProgressDetailPage() {
  const { entryId } = useParams<{ entryId: string }>();
  const [entry, setEntry] = useState<ProgressEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    if (!entryId) return;
    setLoading(true);
    setError(null);
    fetchProgressEntry(entryId)
      .then((record) => {
        setEntry(record);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setEntry(null);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load this progress entry."));
      });
  }

  useEffect(() => {
    load();
  }, [entryId]);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow"><Link to="/progress">Progress</Link> / Entry</p>
          <h1>{entry ? `${entry.metric_type} · ${entry.value}` : "Progress entry"}</h1>
        </div>
      </header>
      {loading ? <PageState kind="loading" title="Loading entry" message="Fetching progress details." /> : null}
      {error ? <PageState kind="error" title="Entry unavailable" message={error} actionLabel="Retry" onAction={load} /> : null}
      {!loading && entry ? (
        <section className="detail-grid">
          <Field label="User" value={entry.user_id} />
          <Field label="Metric" value={entry.metric_type} />
          <Field label="Value" value={`${entry.value} ${entry.unit}`} />
          <Field label="Date" value={formatDay(entry.recorded_date)} />
          <Field label="Source" value={entry.source} />
          <Field label="Goal" value={entry.goal_id ?? "—"} />
          <Field label="Notes" value={entry.notes ?? "—"} />
        </section>
      ) : null}
    </main>
  );
}
