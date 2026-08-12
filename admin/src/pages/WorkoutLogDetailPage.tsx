import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchWorkoutLog } from "../api/admin";
import { errorMessage, Field, formatDate } from "../components/Field";
import { PageState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import type { WorkoutLogDetail } from "../types/admin";

export function WorkoutLogDetailPage() {
  const { logId } = useParams<{ logId: string }>();
  const [log, setLog] = useState<WorkoutLogDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    if (!logId) return;
    setLoading(true);
    setError(null);
    fetchWorkoutLog(logId)
      .then((record) => {
        setLog(record);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setLog(null);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load this workout log."));
      });
  }

  useEffect(() => {
    load();
  }, [logId]);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow"><Link to="/workout-logs">Workout logs</Link> / Session</p>
          <h1>{log ? log.id.slice(0, 8) : "Workout log"}</h1>
        </div>
      </header>
      {loading ? <PageState kind="loading" title="Loading session" message="Fetching completion status and sets." /> : null}
      {error ? <PageState kind="error" title="Session unavailable" message={error} actionLabel="Retry" onAction={load} /> : null}
      {!loading && log ? (
        <>
          <section className="detail-grid">
            <Field label="User" value={log.user_id} />
            <div className="detail-field">
              <span>Status</span>
              <StatusBadge tone={log.status === "completed" ? "success" : log.status === "in_progress" ? "warning" : "neutral"}>{log.status}</StatusBadge>
            </div>
            <Field label="Started" value={formatDate(log.started_at)} />
            <Field label="Completed" value={formatDate(log.completed_at)} />
            <Field label="Duration" value={log.duration_actual_minutes ? `${log.duration_actual_minutes} min` : "—"} />
            <Field label="Notes" value={log.notes ?? "—"} />
          </section>
          <section className="panel">
            <h2>Exercises</h2>
            {log.exercises.length === 0 ? <p className="muted">No exercises logged.</p> : (
              <ul className="plain-list">
                {log.exercises.map((exercise) => (
                  <li key={exercise.id}>
                    {exercise.exercise_name_snapshot}{exercise.skipped ? " (skipped)" : ""} · {exercise.sets.length} sets
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
