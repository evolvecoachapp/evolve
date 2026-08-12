import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchGoal } from "../api/admin";
import { errorMessage, Field, formatDay } from "../components/Field";
import { PageState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import type { Goal } from "../types/admin";

export function GoalDetailPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    if (!goalId) return;
    setLoading(true);
    setError(null);
    fetchGoal(goalId)
      .then((record) => {
        setGoal(record);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setGoal(null);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load this goal."));
      });
  }

  useEffect(() => {
    load();
  }, [goalId]);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow"><Link to="/goals">Goals</Link> / Detail</p>
          <h1>{goal?.description ?? "Goal"}</h1>
        </div>
      </header>
      {loading ? <PageState kind="loading" title="Loading goal" message="Fetching goal details." /> : null}
      {error ? <PageState kind="error" title="Goal unavailable" message={error} actionLabel="Retry" onAction={load} /> : null}
      {!loading && goal ? (
        <section className="detail-grid">
          <Field label="User" value={goal.user_id} />
          <Field label="Type" value={goal.goal_type} />
          <div className="detail-field">
            <span>Status</span>
            <StatusBadge tone={goal.status === "achieved" ? "success" : goal.status === "active" ? "warning" : "neutral"}>{goal.status}</StatusBadge>
          </div>
          <Field label="Priority" value={goal.priority} />
          <Field label="Target" value={goal.target_value ? `${goal.target_value} ${goal.target_unit ?? ""}` : "—"} />
          <Field label="Start" value={formatDay(goal.start_date)} />
          <Field label="Target date" value={formatDay(goal.target_date)} />
        </section>
      ) : null}
    </main>
  );
}
