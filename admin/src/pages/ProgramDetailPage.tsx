import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { archiveProgram, fetchProgram, publishProgram, updateProgram } from "../api/admin";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { errorMessage, Field } from "../components/Field";
import { PageState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import type { ProgramDetail } from "../types/admin";

export function ProgramDetailPage() {
  const { programId } = useParams<{ programId: string }>();
  const [detail, setDetail] = useState<ProgramDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [description, setDescription] = useState("");

  function load() {
    if (!programId) return;
    setLoading(true);
    setError(null);
    fetchProgram(programId)
      .then((record) => {
        setDetail(record);
        setDescription(record.program.description ?? "");
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setDetail(null);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load this program."));
      });
  }

  useEffect(() => {
    load();
  }, [programId]);

  async function save() {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProgram(detail.program.id, { description });
      setDetail({ ...detail, program: updated });
    } catch (caught: unknown) {
      setError(errorMessage(caught, "Unable to update this program."));
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await publishProgram(detail.program.id);
      setDetail({ ...detail, program: updated });
    } catch (caught: unknown) {
      setError(errorMessage(caught, "Unable to publish this program."));
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await archiveProgram(detail.program.id);
      setDetail({ ...detail, program: updated });
      setConfirmArchive(false);
    } catch (caught: unknown) {
      setError(errorMessage(caught, "Unable to archive this program."));
    } finally {
      setSaving(false);
    }
  }

  const program = detail?.program;

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow"><Link to="/programs">Programs</Link> / Template</p>
          <h1>{program?.name ?? "Program"}</h1>
        </div>
        {program ? (
          <div className="header-actions">
            {program.status === "draft" ? (
              <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void publish()}>Publish</button>
            ) : null}
            {program.status !== "archived" ? (
              <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setConfirmArchive(true)}>Archive</button>
            ) : null}
          </div>
        ) : null}
      </header>
      {loading ? <PageState kind="loading" title="Loading program" message="Fetching template, days, and assignments." /> : null}
      {error && !detail ? <PageState kind="error" title="Program unavailable" message={error} actionLabel="Retry" onAction={load} /> : null}
      {error && detail ? <div className="banner banner-error" role="alert">{error}</div> : null}
      {!loading && detail && program ? (
        <>
          <section className="detail-grid">
            <Field label="Slug" value={program.slug} />
            <Field label="Goal" value={program.goal} />
            <Field label="Difficulty" value={program.difficulty_level} />
            <Field label="Duration" value={`${program.duration_weeks} weeks`} />
            <div className="detail-field">
              <span>Status</span>
              <StatusBadge tone={program.status === "published" ? "success" : program.status === "archived" ? "neutral" : "warning"}>
                {program.status}
              </StatusBadge>
            </div>
          </section>
          <form className="panel" onSubmit={(event) => { event.preventDefault(); void save(); }}>
            <label>Description<textarea className="input" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
            <button type="submit" className="btn btn-primary" disabled={saving}>Save</button>
          </form>
          <section className="panel">
            <h2>Scheduled days</h2>
            {detail.days.length === 0 ? <p className="muted">No days scheduled yet.</p> : (
              <ul className="plain-list">
                {detail.days.map((day) => (
                  <li key={day.id}>Week {day.week_number}, day {day.day_number}{day.label ? ` — ${day.label}` : ""}{day.workout_id ? ` · workout ${day.workout_id.slice(0, 8)}` : " · rest"}</li>
                ))}
              </ul>
            )}
          </section>
          <section className="panel">
            <h2>Assignments</h2>
            {detail.assignments.length === 0 ? <p className="muted">No users are assigned to this program.</p> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>User</th><th>Status</th><th>Week</th><th>Day</th></tr></thead>
                  <tbody>
                    {detail.assignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td><Link to={`/users/${assignment.user_id}`}>{assignment.user_id.slice(0, 8)}</Link></td>
                        <td>{assignment.status}</td>
                        <td>{assignment.current_week_number}</td>
                        <td>{assignment.current_day_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
      {confirmArchive ? (
        <ConfirmDialog
          title="Archive program"
          message="Archived programs cannot be assigned to new users. Existing assignments are unchanged. Hard delete is not supported."
          confirmLabel="Archive"
          busy={saving}
          onConfirm={() => void archive()}
          onCancel={() => setConfirmArchive(false)}
        />
      ) : null}
    </main>
  );
}
