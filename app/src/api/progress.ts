import type { ProgressEntryPageDto, ProgressMetricTypeDto } from "../types/api";
import { request } from "./client";

/**
 * Typed calls against the Progress domain: `/api/v1/progress`.
 *
 * Mirrors `src/api/goals.ts` — plain request-wrapping functions, no state.
 * Consumed exclusively by
 * `features/goal-progress-experience/providers/BackendGoalProgressExperienceService.ts`
 * for the latest progress entry used when projecting a Goal Progress dashboard.
 *
 * `POST /progress` (log entry) and `GET /progress/summary` exist on the
 * FastAPI router but are not part of `GoalProgressExperienceService` —
 * `updateProgress()` cannot supply the required metric/value payload, and
 * the Experience contract has no analytics/summary method.
 */

/** `GET /api/v1/progress` — paginated progress entries, optionally filtered. */
export async function listProgressEntries(params?: {
  metric_type?: ProgressMetricTypeDto;
  goal_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}): Promise<ProgressEntryPageDto> {
  const query = new URLSearchParams();
  if (params?.metric_type) {
    query.set("metric_type", params.metric_type);
  }
  if (params?.goal_id) {
    query.set("goal_id", params.goal_id);
  }
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
  return request<ProgressEntryPageDto>(`/api/v1/progress${suffix}`);
}
