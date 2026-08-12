import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { createProgram, fetchPrograms } from "../api/admin";
import { errorMessage } from "../components/Field";
import { PageState } from "../components/PageState";
import { PaginationBar } from "../components/PaginationBar";
import { StatusBadge } from "../components/StatusBadge";
import type { Program } from "../types/admin";

function programTone(status: string): "success" | "warning" | "neutral" {
  if (status === "published") return "success";
  if (status === "archived") return "neutral";
  return "warning";
}

export function ProgramsPage() {
  const [items, setItems] = useState<Program[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    duration_weeks: "4",
    goal: "general_fitness",
    difficulty_level: "beginner",
  });

  function load(nextOffset = offset) {
    setLoading(true);
    setError(null);
    fetchPrograms({ q: search || undefined, status: status || undefined, limit: 20, offset: nextOffset })
      .then((page) => {
        setItems(page.items);
        setTotal(page.total);
        setOffset(page.offset);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setItems([]);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load programs."));
      });
  }

  useEffect(() => {
    load(0);
  }, []);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createProgram({
        name: form.name,
        duration_weeks: Number(form.duration_weeks),
        goal: form.goal,
        difficulty_level: form.difficulty_level,
      });
      setForm({ name: "", duration_weeks: "4", goal: "general_fitness", difficulty_level: "beginner" });
      load(0);
    } catch (caught: unknown) {
      setError(errorMessage(caught, "Unable to create program."));
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Programs</h1>
        </div>
        <p className="muted">{total} programs</p>
      </header>
      <form className="toolbar" onSubmit={(event) => { event.preventDefault(); load(0); }}>
        <input className="input" placeholder="Search name" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <button type="submit" className="btn btn-secondary">Filter</button>
      </form>
      <form className="panel" onSubmit={(event) => void onCreate(event)}>
        <h2>Create program</h2>
        <div className="form-grid">
          <label>Name<input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} /></label>
          <label>Duration weeks<input className="input" type="number" min={1} value={form.duration_weeks} onChange={(event) => setForm({ ...form, duration_weeks: event.target.value })} /></label>
          <label>Goal
            <select className="input" value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })}>
              <option value="general_fitness">General fitness</option>
              <option value="strength">Strength</option>
              <option value="hypertrophy">Hypertrophy</option>
              <option value="endurance">Endurance</option>
            </select>
          </label>
          <label>Difficulty
            <select className="input" value={form.difficulty_level} onChange={(event) => setForm({ ...form, difficulty_level: event.target.value })}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={creating}>Create</button>
      </form>
      {loading ? <PageState kind="loading" title="Loading programs" message="Fetching program templates." /> : null}
      {error ? <PageState kind="error" title="Programs unavailable" message={error} actionLabel="Retry" onAction={() => load(offset)} /> : null}
      {!loading && !error && items.length === 0 ? <PageState kind="empty" title="No programs" message="Create a draft program to get started." /> : null}
      {!loading && !error && items.length > 0 ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Goal</th><th>Weeks</th><th>Status</th></tr>
              </thead>
              <tbody>
                {items.map((program) => (
                  <tr key={program.id}>
                    <td><Link to={`/programs/${program.id}`}>{program.name}</Link></td>
                    <td>{program.goal}</td>
                    <td>{program.duration_weeks}</td>
                    <td><StatusBadge tone={programTone(program.status)}>{program.status}</StatusBadge></td>
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
