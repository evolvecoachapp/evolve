import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  createExercise,
  createMuscleGroup,
  fetchExercises,
  fetchMuscleGroups,
} from "../api/admin";
import { errorMessage, formatLabel } from "../components/Field";
import { FeedbackBanner } from "../components/FeedbackBanner";
import { PageHeader } from "../components/PageHeader";
import { PageState } from "../components/PageState";
import { PaginationBar } from "../components/PaginationBar";
import { StatusBadge } from "../components/StatusBadge";
import type { CatalogItem, Exercise } from "../types/admin";

export function ExercisesPage() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [muscleGroups, setMuscleGroups] = useState<CatalogItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    difficulty_level: "beginner",
    category: "compound",
    muscle_group_id: "",
  });

  function load(nextOffset = offset, quiet = false) {
    if (!quiet) {
      setLoading(true);
    }
    setError(null);
    fetchExercises({
      q: search || undefined,
      category: category || undefined,
      limit: 20,
      offset: nextOffset,
    })
      .then((page) => {
        setItems(page.items);
        setTotal(page.total);
        setOffset(page.offset);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setItems([]);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load exercises."));
      });
  }

  useEffect(() => {
    load(0);
    fetchMuscleGroups()
      .then(setMuscleGroups)
      .catch(() => setMuscleGroups([]));
  }, []);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setNotice(null);
    try {
      let muscleGroupId = form.muscle_group_id;
      if (!muscleGroupId) {
        const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const createdGroup = await createMuscleGroup({
          name: `${form.name} group`,
          slug: `${slug || "muscle"}-group`,
        });
        muscleGroupId = createdGroup.id;
        setMuscleGroups((current) => [...current, createdGroup]);
        setForm((current) => ({ ...current, muscle_group_id: createdGroup.id }));
      }
      await createExercise({
        name: form.name,
        difficulty_level: form.difficulty_level,
        category: form.category,
        muscle_groups: [{ muscle_group_id: muscleGroupId, is_primary: true }],
        equipment: [],
      });
      setForm({ name: "", difficulty_level: "beginner", category: "compound", muscle_group_id: "" });
      setNotice({ tone: "success", message: "Exercise created." });
      load(0, true);
    } catch (caught: unknown) {
      setNotice({ tone: "error", message: errorMessage(caught, "Unable to create exercise.") });
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="page">
      <PageHeader eyebrow="Catalog" title="Exercises" meta={`${total} exercises`} />
      <form
        className="toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          load(0);
        }}
      >
        <label>
          Search
          <input
            className="input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name"
          />
        </label>
        <label>
          Category
          <select className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            <option value="compound">Compound</option>
            <option value="isolation">Isolation</option>
            <option value="cardio">Cardio</option>
            <option value="mobility">Mobility</option>
          </select>
        </label>
        <button type="submit" className="btn btn-secondary">Filter</button>
      </form>
      <form className="panel" onSubmit={(event) => void onCreate(event)}>
        <h2>Create exercise</h2>
        <div className="form-grid">
          <label>
            Name
            <input
              className="input"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              minLength={2}
            />
          </label>
          <label>
            Difficulty
            <select
              className="input"
              value={form.difficulty_level}
              onChange={(event) => setForm({ ...form, difficulty_level: event.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label>
            Category
            <select
              className="input"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            >
              <option value="compound">Compound</option>
              <option value="isolation">Isolation</option>
              <option value="cardio">Cardio</option>
              <option value="mobility">Mobility</option>
            </select>
          </label>
          <label>
            Primary muscle group
            <select
              className="input"
              value={form.muscle_group_id}
              onChange={(event) => setForm({ ...form, muscle_group_id: event.target.value })}
            >
              <option value="">Create from name</option>
              {muscleGroups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? "Creating…" : "Create"}
        </button>
      </form>
      {notice ? <FeedbackBanner tone={notice.tone}>{notice.message}</FeedbackBanner> : null}
      {loading ? <PageState kind="loading" title="Loading exercises" message="Fetching the exercise catalog." /> : null}
      {error ? <PageState kind="error" title="Exercises unavailable" message={error} actionLabel="Retry" onAction={() => load(offset)} /> : null}
      {!loading && !error && items.length === 0 ? (
        <PageState kind="empty" title="No exercises" message="Create an exercise to populate the catalog." />
      ) : null}
      {!loading && !error && items.length > 0 ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((exercise) => (
                  <tr key={exercise.id}>
                    <td><Link to={`/exercises/${exercise.id}`}>{exercise.name}</Link></td>
                    <td>{formatLabel(exercise.category)}</td>
                    <td>{formatLabel(exercise.difficulty_level)}</td>
                    <td>
                      <StatusBadge tone={exercise.is_active ? "success" : "danger"}>
                        {exercise.is_active ? "Active" : "Inactive"}
                      </StatusBadge>
                    </td>
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
