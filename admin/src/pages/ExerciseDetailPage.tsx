import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { deactivateExercise, fetchExercise, updateExercise } from "../api/admin";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { errorMessage, Field, formatLabel } from "../components/Field";
import { FeedbackBanner } from "../components/FeedbackBanner";
import { PageHeader } from "../components/PageHeader";
import { PageState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import type { Exercise } from "../types/admin";

export function ExerciseDetailPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [description, setDescription] = useState("");

  function load() {
    if (!exerciseId) return;
    setLoading(true);
    setError(null);
    fetchExercise(exerciseId)
      .then((record) => {
        setExercise(record);
        setDescription(record.description ?? "");
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setExercise(null);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load this exercise."));
      });
  }

  useEffect(() => {
    load();
  }, [exerciseId]);

  async function save() {
    if (!exercise) return;
    setSaving(true);
    setNotice(null);
    try {
      const updated = await updateExercise(exercise.id, { description });
      setExercise(updated);
      setNotice({ tone: "success", message: "Exercise saved." });
    } catch (caught: unknown) {
      setNotice({ tone: "error", message: errorMessage(caught, "Unable to update this exercise.") });
    } finally {
      setSaving(false);
    }
  }

  async function deactivate() {
    if (!exercise) return;
    setSaving(true);
    setNotice(null);
    try {
      const updated = await deactivateExercise(exercise.id);
      setExercise(updated);
      setConfirm(false);
      setNotice({ tone: "success", message: "Exercise deactivated." });
    } catch (caught: unknown) {
      setNotice({ tone: "error", message: errorMessage(caught, "Unable to deactivate this exercise.") });
      setConfirm(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <PageHeader
        eyebrow={<><Link to="/exercises">Exercises</Link> / Catalog</>}
        title={exercise?.name ?? "Exercise"}
      >
        {exercise?.is_active ? (
          <button type="button" className="btn btn-secondary" onClick={() => setConfirm(true)} disabled={saving}>
            Deactivate
          </button>
        ) : null}
      </PageHeader>
      {loading ? <PageState kind="loading" title="Loading exercise" message="Fetching catalog details." /> : null}
      {error && !exercise ? (
        <PageState kind="error" title="Exercise unavailable" message={error} actionLabel="Retry" onAction={load} />
      ) : null}
      {notice ? <FeedbackBanner tone={notice.tone}>{notice.message}</FeedbackBanner> : null}
      {!loading && exercise ? (
        <>
          <section className="detail-grid">
            <Field label="Slug" value={exercise.slug} />
            <Field label="Category" value={formatLabel(exercise.category)} />
            <Field label="Difficulty" value={formatLabel(exercise.difficulty_level)} />
            <div className="detail-field">
              <span>Status</span>
              <StatusBadge tone={exercise.is_active ? "success" : "danger"}>
                {exercise.is_active ? "Active" : "Inactive"}
              </StatusBadge>
            </div>
            <Field
              label="Muscle groups"
              value={exercise.muscle_groups.map((group) => `${group.name}${group.is_primary ? " (primary)" : ""}`).join(", ") || "—"}
            />
            <Field label="Equipment" value={exercise.equipment.map((item) => item.name).join(", ") || "—"} />
          </section>
          <form className="panel" onSubmit={(event) => { event.preventDefault(); void save(); }}>
            <label>
              Description
              <textarea className="input" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
            </label>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        </>
      ) : null}
      {confirm ? (
        <ConfirmDialog
          title="Deactivate exercise"
          message="This hides the exercise from the public catalog. Hard delete is not supported."
          confirmLabel="Deactivate"
          busy={saving}
          onConfirm={() => void deactivate()}
          onCancel={() => setConfirm(false)}
        />
      ) : null}
    </main>
  );
}
