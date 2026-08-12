import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { createWorkout, fetchExercises, fetchWorkouts } from "../api/admin";
import { errorMessage } from "../components/Field";
import { PageState } from "../components/PageState";
import { PaginationBar } from "../components/PaginationBar";
import { StatusBadge } from "../components/StatusBadge";
import type { Exercise, Workout } from "../types/admin";

export function WorkoutsPage() {
  const [items, setItems] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", exercise_id: "", estimated_duration_minutes: "45" });

  function load(nextOffset = offset) {
    setLoading(true);
    setError(null);
    fetchWorkouts({ q: search || undefined, limit: 20, offset: nextOffset })
      .then((page) => {
        setItems(page.items);
        setTotal(page.total);
        setOffset(page.offset);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setItems([]);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load workouts."));
      });
  }

  useEffect(() => {
    load(0);
    fetchExercises({ limit: 100, offset: 0 }).then((page) => setExercises(page.items)).catch(() => setExercises([]));
  }, []);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createWorkout({
        name: form.name,
        estimated_duration_minutes: Number(form.estimated_duration_minutes),
        exercises: [
          {
            exercise_id: form.exercise_id,
            order_index: 0,
            target_sets: 3,
            target_reps_min: 8,
            target_reps_max: 12,
            rest_seconds: 90,
          },
        ],
      });
      setForm({ name: "", exercise_id: "", estimated_duration_minutes: "45" });
      load(0);
    } catch (caught: unknown) {
      setError(errorMessage(caught, "Unable to create workout."));
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Workouts</h1>
        </div>
        <p className="muted">{total} templates</p>
      </header>
      <form className="toolbar" onSubmit={(event) => { event.preventDefault(); load(0); }}>
        <input className="input" placeholder="Search name" value={search} onChange={(event) => setSearch(event.target.value)} />
        <button type="submit" className="btn btn-secondary">Filter</button>
      </form>
      <form className="panel" onSubmit={(event) => void onCreate(event)}>
        <h2>Create workout</h2>
        <div className="form-grid">
          <label>Name<input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} /></label>
          <label>Duration minutes<input className="input" type="number" min={1} value={form.estimated_duration_minutes} onChange={(event) => setForm({ ...form, estimated_duration_minutes: event.target.value })} /></label>
          <label>First exercise
            <select className="input" value={form.exercise_id} onChange={(event) => setForm({ ...form, exercise_id: event.target.value })} required>
              <option value="">Select exercise</option>
              {exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
            </select>
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={creating}>Create</button>
      </form>
      {loading ? <PageState kind="loading" title="Loading workouts" message="Fetching workout templates." /> : null}
      {error ? <PageState kind="error" title="Workouts unavailable" message={error} actionLabel="Retry" onAction={() => load(offset)} /> : null}
      {!loading && !error && items.length === 0 ? <PageState kind="empty" title="No workouts" message="Create a workout template to get started." /> : null}
      {!loading && !error && items.length > 0 ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Duration</th><th>Exercises</th><th>Status</th></tr></thead>
              <tbody>
                {items.map((workout) => (
                  <tr key={workout.id}>
                    <td><Link to={`/workouts/${workout.id}`}>{workout.name}</Link></td>
                    <td>{workout.estimated_duration_minutes ?? "—"}</td>
                    <td>{workout.exercises.length}</td>
                    <td><StatusBadge tone={workout.is_active ? "success" : "danger"}>{workout.is_active ? "Active" : "Inactive"}</StatusBadge></td>
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
