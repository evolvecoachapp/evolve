import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchMeal } from "../api/admin";
import { errorMessage, Field } from "../components/Field";
import { PageState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import type { Meal } from "../types/admin";

export function MealDetailPage() {
  const { mealId } = useParams<{ mealId: string }>();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    if (!mealId) return;
    setLoading(true);
    setError(null);
    fetchMeal(mealId)
      .then((record) => {
        setMeal(record);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setMeal(null);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load this meal."));
      });
  }

  useEffect(() => {
    load();
  }, [mealId]);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow"><Link to="/nutrition">Nutrition</Link> / Meal</p>
          <h1>{meal?.name ?? "Meal"}</h1>
        </div>
      </header>
      {loading ? <PageState kind="loading" title="Loading meal" message="Fetching meal template details." /> : null}
      {error ? <PageState kind="error" title="Meal unavailable" message={error} actionLabel="Retry" onAction={load} /> : null}
      {!loading && meal ? (
        <section className="detail-grid">
          <Field label="Type" value={meal.meal_type} />
          <Field label="Calories" value={meal.calories} />
          <Field label="Protein" value={meal.protein_g} />
          <Field label="Carbs" value={meal.carbs_g} />
          <Field label="Fat" value={meal.fat_g} />
          <div className="detail-field">
            <span>Status</span>
            <StatusBadge tone={meal.is_active ? "success" : "danger"}>{meal.is_active ? "Active" : "Inactive"}</StatusBadge>
          </div>
          <Field label="Owner" value={meal.created_by_id ?? "—"} />
        </section>
      ) : null}
    </main>
  );
}
