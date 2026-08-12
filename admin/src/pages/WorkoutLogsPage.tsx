import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { fetchWorkoutLogs } from "../api/admin";
import { errorMessage, formatDay, formatLabel, shortId } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { PageState } from "../components/PageState";
import { PaginationBar } from "../components/PaginationBar";
import { StatusBadge } from "../components/StatusBadge";
import { UserLink } from "../components/UserLink";
import type { WorkoutLogSummary } from "../types/admin";

function logTone(status: string): "success" | "warning" | "neutral" | "danger" {
  if (status === "completed") return "success";
  if (status === "in_progress") return "warning";
  if (status === "skipped") return "danger";
  return "neutral";
}

export function WorkoutLogsPage() {
  const [params] = useSearchParams();
  const [items, setItems] = useState<WorkoutLogSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [userId, setUserId] = useState(params.get("user") ?? "");
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
      <PageHeader eyebrow="Activity" title="Workout logs" meta={`${total} sessions`} />
      <p className="readonly-note">Read-only athlete sessions. Admin cannot start, finish, or skip logs.</p>
      <form className="toolbar" onSubmit={(event) => { event.preventDefault(); load(0); }}>
        <label>
          User id
          <input className="input" value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Filter by user id" />
        </label>
        <label>
          Status
          <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="skipped">Skipped</option>
          </select>
        </label>
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
                    <td><Link to={`/workout-logs/${log.id}`}>{shortId(log.id)}</Link></td>
                    <td><UserLink userId={log.user_id} /></td>
                    <td><StatusBadge tone={logTone(log.status)}>{formatLabel(log.status)}</StatusBadge></td>
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
