import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchMealLogs, fetchMeals, fetchNutritionTargets } from "../api/admin";
import { errorMessage, formatDate, formatDay } from "../components/Field";
import { PageState } from "../components/PageState";
import { PaginationBar } from "../components/PaginationBar";
import type { Meal, MealLog, NutritionTargets } from "../types/admin";

export function NutritionPage() {
  const [tab, setTab] = useState<"meals" | "logs" | "targets">("meals");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [mealTotal, setMealTotal] = useState(0);
  const [logTotal, setLogTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [userId, setUserId] = useState("");
  const [targets, setTargets] = useState<NutritionTargets | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function loadMeals(nextOffset = 0) {
    setLoading(true);
    setError(null);
    fetchMeals({ createdById: userId || undefined, limit: 20, offset: nextOffset })
      .then((page) => {
        setMeals(page.items);
        setMealTotal(page.total);
        setOffset(page.offset);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setMeals([]);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load meals."));
      });
  }

  function loadLogs(nextOffset = 0) {
    setLoading(true);
    setError(null);
    fetchMealLogs({ userId: userId || undefined, limit: 20, offset: nextOffset })
      .then((page) => {
        setLogs(page.items);
        setLogTotal(page.total);
        setOffset(page.offset);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setLogs([]);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load meal logs."));
      });
  }

  function loadTargets() {
    if (!userId) {
      setError("Enter a user id to load nutrition targets.");
      setTargets(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchNutritionTargets(userId)
      .then((record) => {
        setTargets(record);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setTargets(null);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load nutrition targets."));
      });
  }

  useEffect(() => {
    loadMeals(0);
  }, []);

  function switchTab(next: "meals" | "logs" | "targets") {
    setTab(next);
    setOffset(0);
    if (next === "meals") loadMeals(0);
    if (next === "logs") loadLogs(0);
    if (next === "targets") loadTargets();
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Activity</p>
          <h1>Nutrition</h1>
        </div>
      </header>
      <div className="tabs">
        <button type="button" className={tab === "meals" ? "tab active" : "tab"} onClick={() => switchTab("meals")}>Meals</button>
        <button type="button" className={tab === "logs" ? "tab active" : "tab"} onClick={() => switchTab("logs")}>Meal logs</button>
        <button type="button" className={tab === "targets" ? "tab active" : "tab"} onClick={() => switchTab("targets")}>Targets</button>
      </div>
      <form className="toolbar" onSubmit={(event) => { event.preventDefault(); switchTab(tab); }}>
        <input className="input" placeholder="User id" value={userId} onChange={(event) => setUserId(event.target.value)} />
        <button type="submit" className="btn btn-secondary">Apply</button>
      </form>
      {loading ? <PageState kind="loading" title="Loading nutrition" message="Fetching meals, logs, or targets." /> : null}
      {error ? <PageState kind="error" title="Nutrition unavailable" message={error} actionLabel="Retry" onAction={() => switchTab(tab)} /> : null}
      {!loading && !error && tab === "meals" && meals.length === 0 ? <PageState kind="empty" title="No meals" message="Meal templates will appear here." /> : null}
      {!loading && !error && tab === "meals" && meals.length > 0 ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Type</th><th>Calories</th><th>Owner</th></tr></thead>
              <tbody>
                {meals.map((meal) => (
                  <tr key={meal.id}>
                    <td><Link to={`/nutrition/meals/${meal.id}`}>{meal.name}</Link></td>
                    <td>{meal.meal_type}</td>
                    <td>{meal.calories}</td>
                    <td>{meal.created_by_id ? meal.created_by_id.slice(0, 8) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar total={mealTotal} limit={20} offset={offset} onChange={(next) => loadMeals(next)} />
        </>
      ) : null}
      {!loading && !error && tab === "logs" && logs.length === 0 ? <PageState kind="empty" title="No meal logs" message="Logged meals will appear here." /> : null}
      {!loading && !error && tab === "logs" && logs.length > 0 ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Meal</th><th>User</th><th>Calories</th><th>Consumed</th></tr></thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td><Link to={`/nutrition/logs/${log.id}`}>{log.name_snapshot}</Link></td>
                    <td><Link to={`/users/${log.user_id}`}>{log.user_id.slice(0, 8)}</Link></td>
                    <td>{log.calories}</td>
                    <td>{formatDate(log.consumed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar total={logTotal} limit={20} offset={offset} onChange={(next) => loadLogs(next)} />
        </>
      ) : null}
      {!loading && !error && tab === "targets" && targets ? (
        <section className="detail-grid">
          <div className="detail-field"><span>Date</span><strong>{formatDay(targets.for_date)}</strong></div>
          <div className="detail-field"><span>Target calories</span><strong>{targets.targets.calories}</strong></div>
          <div className="detail-field"><span>Actual calories</span><strong>{targets.actual.calories}</strong></div>
          <div className="detail-field"><span>Protein</span><strong>{targets.actual.protein_g} / {targets.targets.protein_g}</strong></div>
          <div className="detail-field"><span>Carbs</span><strong>{targets.actual.carbs_g} / {targets.targets.carbs_g}</strong></div>
          <div className="detail-field"><span>Fat</span><strong>{targets.actual.fat_g} / {targets.targets.fat_g}</strong></div>
        </section>
      ) : null}
    </main>
  );
}
