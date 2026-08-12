import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchCheckIns, fetchReadiness } from "../api/admin";
import { errorMessage, formatDay } from "../components/Field";
import { PageState } from "../components/PageState";
import { PaginationBar } from "../components/PaginationBar";
import type { Readiness, RecoveryCheckIn } from "../types/admin";

export function RecoveryPage() {
  const [items, setItems] = useState<RecoveryCheckIn[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [userId, setUserId] = useState("");
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load(nextOffset = 0) {
    setLoading(true);
    setError(null);
    fetchCheckIns({ userId: userId || undefined, limit: 20, offset: nextOffset })
      .then((page) => {
        setItems(page.items);
        setTotal(page.total);
        setOffset(page.offset);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setItems([]);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load recovery check-ins."));
      });
  }

  function loadReadiness() {
    if (!userId) {
      setError("Enter a user id to load readiness.");
      return;
    }
    setError(null);
    fetchReadiness(userId)
      .then(setReadiness)
      .catch((caught: unknown) => {
        setReadiness(null);
        setError(errorMessage(caught, "Unable to load readiness."));
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
          <h1>Recovery</h1>
        </div>
        <p className="muted">{total} check-ins</p>
      </header>
      <form className="toolbar" onSubmit={(event) => { event.preventDefault(); load(0); }}>
        <input className="input" placeholder="Filter by user id" value={userId} onChange={(event) => setUserId(event.target.value)} />
        <button type="submit" className="btn btn-secondary">Filter</button>
        <button type="button" className="btn btn-secondary" onClick={loadReadiness}>Load readiness</button>
      </form>
      {readiness ? (
        <section className="detail-grid">
          <div className="detail-field"><span>Readiness</span><strong>{readiness.readiness_score} · {readiness.readiness_level}</strong></div>
          <div className="detail-field"><span>Date</span><strong>{formatDay(readiness.for_date)}</strong></div>
        </section>
      ) : null}
      {loading ? <PageState kind="loading" title="Loading recovery" message="Fetching check-ins." /> : null}
      {error ? <PageState kind="error" title="Recovery unavailable" message={error} actionLabel="Retry" onAction={() => load(offset)} /> : null}
      {!loading && !error && items.length === 0 ? <PageState kind="empty" title="No check-ins" message="Recovery check-ins will appear here." /> : null}
      {!loading && !error && items.length > 0 ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Date</th><th>User</th><th>Sleep</th><th>Soreness</th><th>Fatigue</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><Link to={`/recovery/${item.id}`}>{formatDay(item.checkin_date)}</Link></td>
                    <td><Link to={`/users/${item.user_id}`}>{item.user_id.slice(0, 8)}</Link></td>
                    <td>{item.sleep_hours}</td>
                    <td>{item.soreness}</td>
                    <td>{item.fatigue}</td>
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
