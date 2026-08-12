import type { GoalPageDto, GoalReadDto, GoalStatusDto, GoalUpdateRequest } from "../types/api";
import { request } from "./client";

/**
 * Typed calls against the Goals domain: `/api/v1/goals`.
 *
 * Mirrors `src/api/nutrition.ts` / `src/api/recovery.ts` — plain
 * request-wrapping functions, no state. Consumed exclusively by
 * `features/goal-progress-experience/providers/BackendGoalProgressExperienceService.ts`.
 *
 * Only the endpoints the Goal Progress Experience backend provider actually
 * uses are wrapped here (list + patch). Create / get-by-id / delete exist on
 * the FastAPI router but are not part of `GoalProgressExperienceService`.
 */

/** `GET /api/v1/goals` — paginated goals, optionally filtered by status. */
export async function listGoals(params?: {
  status?: GoalStatusDto;
  limit?: number;
  offset?: number;
}): Promise<GoalPageDto> {
  const query = new URLSearchParams();
  if (params?.status) {
    query.set("status", params.status);
  }
  if (params?.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params?.offset !== undefined) {
    query.set("offset", String(params.offset));
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<GoalPageDto>(`/api/v1/goals${suffix}`);
}

/** `PATCH /api/v1/goals/{id}` — partial update, including status transitions. */
export async function updateGoal(
  goalId: string,
  data: GoalUpdateRequest,
): Promise<GoalReadDto> {
  return request<GoalReadDto>(`/api/v1/goals/${encodeURIComponent(goalId)}`, {
    method: "PATCH",
    body: data,
  });
}
