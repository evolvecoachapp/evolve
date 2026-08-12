import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchMealLog } from "../api/admin";
import { errorMessage, Field, formatDate } from "../components/Field";
import { PageState } from "../components/PageState";
import type { MealLog } from "../types/admin";

export function MealLogDetailPage() {
  const { logId } = useParams<{ logId: string }>();
  const [log, setLog] = useState<MealLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    if (!logId) return;
    setLoading(true);
    setError(null);
    fetchMealLog(logId)
      .then((record) => {
        setLog(record);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setLog(null);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load this meal log."));
      });
  }

  useEffect(() => {
    load();
  }, [logId]);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow"><Link to="/nutrition">Nutrition</Link> / Meal log</p>
          <h1>{log?.name_snapshot ?? "Meal log"}</h1>
        </div>
      </header>
      {loading ? <PageState kind="loading" title="Loading meal log" message="Fetching diary entry details." /> : null}
      {error ? <PageState kind="error" title="Meal log unavailable" message={error} actionLabel="Retry" onAction={load} /> : null}
      {!loading && log ? (
        <section className="detail-grid">
          <Field label="User" value={log.user_id} />
          <Field label="Type" value={log.meal_type} />
          <Field label="Calories" value={log.calories} />
          <Field label="Protein" value={log.protein_g} />
          <Field label="Carbs" value={log.carbs_g} />
          <Field label="Fat" value={log.fat_g} />
          <Field label="Consumed" value={formatDate(log.consumed_at)} />
          <Field label="Notes" value={log.notes ?? "—"} />
        </section>
      ) : null}
    </main>
  );
}
