import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { fetchGoals } from "../api/admin";
import { errorMessage, formatDay, formatLabel } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { PageState } from "../components/PageState";
import { PaginationBar } from "../components/PaginationBar";
import { StatusBadge } from "../components/StatusBadge";
import { UserLink } from "../components/UserLink";
import type { Goal } from "../types/admin";

function goalTone(status: string): "success" | "warning" | "neutral" | "danger" {
  if (status === "achieved") return "success";
  if (status === "active") return "warning";
  if (status === "abandoned") return "danger";
  return "neutral";
}

export function GoalsPage() {
  const [params] = useSearchParams();
  const [items, setItems] = useState<Goal[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [userId, setUserId] = useState(params.get("user") ?? "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load(nextOffset = 0) {
    setLoading(true);
    setError(null);
    fetchGoals({ userId: userId || undefined, status: status || undefined, limit: 20, offset: nextOffset })
      .then((page) => {
        setItems(page.items);
        setTotal(page.total);
        setOffset(page.offset);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setItems([]);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load goals."));
      });
  }

  useEffect(() => {
    load(0);
  }, []);

  return (
    <main className="page">
      <PageHeader eyebrow="Activity" title="Goals" meta={`${total} goals`} />
      <p className="readonly-note">Read-only athlete goals. Admin cannot create or close goals.</p>
      <form className="toolbar" onSubmit={(event) => { event.preventDefault(); load(0); }}>
        <label>
          User id
          <input className="input" value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Filter by user id" />
        </label>
        <label>
          Status
          <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="achieved">Achieved</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </label>
        <button type="submit" className="btn btn-secondary">Filter</button>
      </form>
      {loading ? <PageState kind="loading" title="Loading goals" message="Fetching athlete goals." /> : null}
      {error ? <PageState kind="error" title="Goals unavailable" message={error} actionLabel="Retry" onAction={() => load(offset)} /> : null}
      {!loading && !error && items.length === 0 ? <PageState kind="empty" title="No goals" message="Athlete goals will appear here." /> : null}
      {!loading && !error && items.length > 0 ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Goal</th><th>User</th><th>Status</th><th>Target date</th></tr></thead>
              <tbody>
                {items.map((goal) => (
                  <tr key={goal.id}>
                    <td><Link to={`/goals/${goal.id}`}>{goal.description}</Link></td>
                    <td><UserLink userId={goal.user_id} /></td>
                    <td><StatusBadge tone={goalTone(goal.status)}>{formatLabel(goal.status)}</StatusBadge></td>
                    <td>{formatDay(goal.target_date)}</td>
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
