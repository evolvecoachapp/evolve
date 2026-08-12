import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchCheckIn } from "../api/admin";
import { errorMessage, Field, formatDay } from "../components/Field";
import { PageState } from "../components/PageState";
import type { RecoveryCheckIn } from "../types/admin";

export function RecoveryDetailPage() {
  const { checkInId } = useParams<{ checkInId: string }>();
  const [checkIn, setCheckIn] = useState<RecoveryCheckIn | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    if (!checkInId) return;
    setLoading(true);
    setError(null);
    fetchCheckIn(checkInId)
      .then((record) => {
        setCheckIn(record);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setCheckIn(null);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load this check-in."));
      });
  }

  useEffect(() => {
    load();
  }, [checkInId]);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow"><Link to="/recovery">Recovery</Link> / Check-in</p>
          <h1>{checkIn ? formatDay(checkIn.checkin_date) : "Check-in"}</h1>
        </div>
      </header>
      {loading ? <PageState kind="loading" title="Loading check-in" message="Fetching athlete recovery details." /> : null}
      {error ? <PageState kind="error" title="Check-in unavailable" message={error} actionLabel="Retry" onAction={load} /> : null}
      {!loading && checkIn ? (
        <section className="detail-grid">
          <Field label="User" value={checkIn.user_id} />
          <Field label="Sleep hours" value={checkIn.sleep_hours} />
          <Field label="Sleep quality" value={String(checkIn.sleep_quality)} />
          <Field label="Soreness" value={String(checkIn.soreness)} />
          <Field label="Fatigue" value={String(checkIn.fatigue)} />
          <Field label="Resting HR" value={checkIn.resting_heart_rate ? String(checkIn.resting_heart_rate) : "—"} />
          <Field label="HRV" value={checkIn.hrv_ms ? String(checkIn.hrv_ms) : "—"} />
          <Field label="Notes" value={checkIn.notes ?? "—"} />
        </section>
      ) : null}
    </main>
  );
}
