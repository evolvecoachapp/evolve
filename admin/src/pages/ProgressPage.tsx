import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchProgress, fetchProgressSummary } from "../api/admin";
import { errorMessage, formatDay } from "../components/Field";
import { PageState } from "../components/PageState";
import { PaginationBar } from "../components/PaginationBar";
import type { ProgressEntry, ProgressSummary } from "../types/admin";

export function ProgressPage() {
  const [items, setItems] = useState<ProgressEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [userId, setUserId] = useState("");
  const [metricType, setMetricType] = useState("");
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load(nextOffset = 0) {
    setLoading(true);
    setError(null);
    fetchProgress({ userId: userId || undefined, metricType: metricType || undefined, limit: 20, offset: nextOffset })
      .then((page) => {
        setItems(page.items);
        setTotal(page.total);
        setOffset(page.offset);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setItems([]);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load progress entries."));
      });
  }

  function loadSummary() {
    if (!userId) {
      setError("Enter a user id to load a progress summary.");
      return;
    }
    setError(null);
    fetchProgressSummary({
      userId,
      metricType: metricType || "body_weight",
    })
      .then(setSummary)
      .catch((caught: unknown) => {
        setSummary(null);
        setError(errorMessage(caught, "Unable to load progress summary."));
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
          <h1>Progress</h1>
        </div>
        <p className="muted">{total} entries</p>
      </header>
      <form className="toolbar" onSubmit={(event) => { event.preventDefault(); load(0); }}>
        <input className="input" placeholder="Filter by user id" value={userId} onChange={(event) => setUserId(event.target.value)} />
        <select className="input" value={metricType} onChange={(event) => setMetricType(event.target.value)}>
          <option value="">All metrics</option>
          <option value="body_weight">Body weight</option>
          <option value="body_fat_percentage">Body fat</option>
          <option value="lift_pr">Lift PR</option>
        </select>
        <button type="submit" className="btn btn-secondary">Filter</button>
        <button type="button" className="btn btn-secondary" onClick={loadSummary}>Load summary</button>
      </form>
      {summary ? (
        <section className="detail-grid">
          <div className="detail-field"><span>Trend</span><strong>{summary.stats.trend_direction}</strong></div>
          <div className="detail-field"><span>Window</span><strong>{formatDay(summary.window_start)} – {formatDay(summary.window_end)}</strong></div>
          <div className="detail-field"><span>Narrative</span><strong>{summary.narrative_text}</strong></div>
        </section>
      ) : null}
      {loading ? <PageState kind="loading" title="Loading progress" message="Fetching progress entries." /> : null}
      {error ? <PageState kind="error" title="Progress unavailable" message={error} actionLabel="Retry" onAction={() => load(offset)} /> : null}
      {!loading && !error && items.length === 0 ? <PageState kind="empty" title="No progress entries" message="Logged progress will appear here." /> : null}
      {!loading && !error && items.length > 0 ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Date</th><th>User</th><th>Metric</th><th>Value</th></tr></thead>
              <tbody>
                {items.map((entry) => (
                  <tr key={entry.id}>
                    <td><Link to={`/progress/${entry.id}`}>{formatDay(entry.recorded_date)}</Link></td>
                    <td><Link to={`/users/${entry.user_id}`}>{entry.user_id.slice(0, 8)}</Link></td>
                    <td>{entry.metric_type}</td>
                    <td>{entry.value} {entry.unit}</td>
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
