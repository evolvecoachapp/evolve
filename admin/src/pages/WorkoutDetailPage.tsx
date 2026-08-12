import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { deactivateWorkout, fetchWorkout, updateWorkout } from "../api/admin";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { errorMessage, Field } from "../components/Field";
import { FeedbackBanner } from "../components/FeedbackBanner";
import { PageHeader } from "../components/PageHeader";
import { PageState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import type { Workout } from "../types/admin";

export function WorkoutDetailPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [description, setDescription] = useState("");

  function load() {
    if (!workoutId) return;
    setLoading(true);
    setError(null);
    fetchWorkout(workoutId)
      .then((record) => {
        setWorkout(record);
        setDescription(record.description ?? "");
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setWorkout(null);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load this workout."));
      });
  }

  useEffect(() => {
    load();
  }, [workoutId]);

  async function save() {
    if (!workout) return;
    setSaving(true);
    setNotice(null);
    try {
      setWorkout(await updateWorkout(workout.id, { description }));
      setNotice({ tone: "success", message: "Workout saved." });
    } catch (caught: unknown) {
      setNotice({ tone: "error", message: errorMessage(caught, "Unable to update this workout.") });
    } finally {
      setSaving(false);
    }
  }

  async function deactivate() {
    if (!workout) return;
    setSaving(true);
    setNotice(null);
    try {
      setWorkout(await deactivateWorkout(workout.id));
      setConfirm(false);
      setNotice({ tone: "success", message: "Workout deactivated." });
    } catch (caught: unknown) {
      setNotice({ tone: "error", message: errorMessage(caught, "Unable to deactivate this workout.") });
      setConfirm(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <PageHeader
        eyebrow={<><Link to="/workouts">Workouts</Link> / Template</>}
        title={workout?.name ?? "Workout"}
      >
        {workout?.is_active ? (
          <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setConfirm(true)}>Deactivate</button>
        ) : null}
      </PageHeader>
      {loading ? <PageState kind="loading" title="Loading workout" message="Fetching template details." /> : null}
      {error && !workout ? <PageState kind="error" title="Workout unavailable" message={error} actionLabel="Retry" onAction={load} /> : null}
      {notice ? <FeedbackBanner tone={notice.tone}>{notice.message}</FeedbackBanner> : null}
      {!loading && workout ? (
        <>
          <section className="detail-grid">
            <Field label="Slug" value={workout.slug} />
            <Field label="Duration" value={workout.estimated_duration_minutes ? `${workout.estimated_duration_minutes} min` : "—"} />
            <div className="detail-field">
              <span>Status</span>
              <StatusBadge tone={workout.is_active ? "success" : "danger"}>{workout.is_active ? "Active" : "Inactive"}</StatusBadge>
            </div>
          </section>
          <form className="panel" onSubmit={(event) => { event.preventDefault(); void save(); }}>
            <label>
              Description
              <textarea className="input" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
          <section className="panel">
            <h2>Exercises</h2>
            {workout.exercises.length === 0 ? <p className="muted">No exercises on this template.</p> : (
              <ul className="plain-list">
                {workout.exercises.map((item) => (
                  <li key={item.id}>#{item.order_index} · {item.target_sets} sets · {item.target_reps_min ?? "?"}–{item.target_reps_max ?? "?"} reps</li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
      {confirm ? (
        <ConfirmDialog
          title="Deactivate workout"
          message="This hides the template from active assignment. Hard delete is not supported."
          confirmLabel="Deactivate"
          busy={saving}
          onConfirm={() => void deactivate()}
          onCancel={() => setConfirm(false)}
        />
      ) : null}
    </main>
  );
}
