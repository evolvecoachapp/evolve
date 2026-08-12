import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchWorkoutLogs } from "../api/admin";
import { errorMessage, formatDay } from "../components/Field";
import { PageState } from "../components/PageState";
import { PaginationBar } from "../components/PaginationBar";
import { StatusBadge } from "../components/StatusBadge";
import type { WorkoutLogSummary } from "../types/admin";

function logTone(status: string): "success" | "warning" | "neutral" | "danger" {
  if (status === "completed") return "success";
  if (status === "in_progress") return "warning";
  if (status === "skipped") return "danger";
  return "neutral";
}

export function WorkoutLogsPage() {
  const [items, setItems] = useState<WorkoutLogSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load(nextOffset = offset) {
    setLoading(true);
    setError(null);
    fetchWorkoutLogs({ userId: userId || undefined, status: status || undefined, limit: 20, offset: nextOffset })
      .then((page) => {
        setItems(page.items);
        setTotal(page.total);
        setOffset(page.offset);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setItems([]);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load workout logs."));
      });
  }

  useEffect(() => {
    load(0);
  }, []);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Activity</p>
          <h1>Workout logs</h1>
        </div>
        <p className="muted">{total} sessions</p>
      </header>
      <form className="toolbar" onSubmit={(event) => { event.preventDefault(); load(0); }}>
        <input className="input" placeholder="Filter by user id" value={userId} onChange={(event) => setUserId(event.target.value)} />
        <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="skipped">Skipped</option>
        </select>
        <button type="submit" className="btn btn-secondary">Filter</button>
      </form>
      {loading ? <PageState kind="loading" title="Loading workout logs" message="Fetching session history." /> : null}
      {error ? <PageState kind="error" title="Workout logs unavailable" message={error} actionLabel="Retry" onAction={() => load(offset)} /> : null}
      {!loading && !error && items.length === 0 ? <PageState kind="empty" title="No workout logs" message="Logged sessions will appear here." /> : null}
      {!loading && !error && items.length > 0 ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Session</th><th>User</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {items.map((log) => (
                  <tr key={log.id}>
                    <td><Link to={`/workout-logs/${log.id}`}>{log.id.slice(0, 8)}</Link></td>
                    <td><Link to={`/users/${log.user_id}`}>{log.user_id.slice(0, 8)}</Link></td>
                    <td><StatusBadge tone={logTone(log.status)}>{log.status}</StatusBadge></td>
                    <td>{formatDay(log.scheduled_date ?? log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar total={total} limit={20} offset={offset} onChange={(next) => load(next)} />
        </>
      ) : null}
    </main>
  );
}
