import type { DailyNutritionReadDto, MealLogPageDto } from "../types/api";
import { request } from "./client";

/**
 * Typed calls against the Nutrition domain: `/api/v1/nutrition`.
 *
 * Mirrors `src/api/workouts.ts` — plain request-wrapping functions, no state.
 * Consumed exclusively by
 * `features/nutrition-experience/providers/BackendNutritionExperienceService.ts`.
 *
 * Only the read endpoints the Nutrition Experience backend provider actually
 * uses are wrapped here. Meal-template CRUD and meal-log mutations exist on
 * the FastAPI router but are not part of `NutritionExperienceService`.
 */

/** `GET /api/v1/nutrition/targets` — daily targets, logged totals, and adherence. */
export async function getDailyNutritionTargets(params?: {
  for_date?: string;
}): Promise<DailyNutritionReadDto> {
  const query = new URLSearchParams();
  if (params?.for_date) {
    query.set("for_date", params.for_date);
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<DailyNutritionReadDto>(`/api/v1/nutrition/targets${suffix}`);
}

/** `GET /api/v1/nutrition/logs` — paginated meal logs, optionally filtered by date. */
export async function listMealLogs(params?: {
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}): Promise<MealLogPageDto> {
  const query = new URLSearchParams();
  if (params?.date_from) {
    query.set("date_from", params.date_from);
  }
  if (params?.date_to) {
    query.set("date_to", params.date_to);
  }
  if (params?.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params?.offset !== undefined) {
    query.set("offset", String(params.offset));
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<MealLogPageDto>(`/api/v1/nutrition/logs${suffix}`);
}
