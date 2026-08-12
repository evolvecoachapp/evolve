import type {
  WorkoutLogDetailDto,
  WorkoutLogExerciseCreateRequest,
  WorkoutLogExerciseReadDto,
  WorkoutLogFinishRequest,
  WorkoutLogPageDto,
  WorkoutLogStartRequest,
  WorkoutLogStatusDto,
  WorkoutPageDto,
  WorkoutPreviewDto,
  WorkoutPublicDto,
  WorkoutSetLogCreateRequest,
  WorkoutSetLogReadDto,
  WorkoutSetLogUpdateRequest,
} from "../types/api";
import { request } from "./client";

/**
 * Typed calls against the Workout domain: `/api/v1/workouts`,
 * `/api/v1/workout-resolution`, and `/api/v1/workout-logs`.
 *
 * Mirrors `src/api/users.ts` — plain request-wrapping functions, no state.
 * Consumed by `features/workout/providers/BackendWorkoutService.ts` and
 * `features/workout-runtime/providers/BackendWorkoutRuntimeService.ts`.
 */

/** `GET /api/v1/workout-resolution/today` — "what should the user do right now?". */
export async function getTodayPreview(): Promise<WorkoutPreviewDto> {
  return request<WorkoutPreviewDto>("/api/v1/workout-resolution/today");
}

/** `POST /api/v1/workout-resolution/advance-rest-day` — move past a scheduled rest day. */
export async function advanceRestDay(): Promise<WorkoutPreviewDto> {
  return request<WorkoutPreviewDto>("/api/v1/workout-resolution/advance-rest-day", {
    method: "POST",
  });
}

/** `GET /api/v1/workouts/{idOrSlug}` — a single workout template, by id or slug. */
export async function getWorkoutTemplate(idOrSlug: string): Promise<WorkoutPublicDto> {
  return request<WorkoutPublicDto>(`/api/v1/workouts/${encodeURIComponent(idOrSlug)}`);
}

/** `GET /api/v1/workouts` — a paginated, optionally-searched page of workout templates. */
export async function listWorkoutTemplates(params?: {
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<WorkoutPageDto> {
  const query = new URLSearchParams();
  if (params?.q) {
    query.set("q", params.q);
  }
  if (params?.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params?.offset !== undefined) {
    query.set("offset", String(params.offset));
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<WorkoutPageDto>(`/api/v1/workouts${suffix}`);
}

/** `POST /api/v1/workout-logs/start` — start a new logged session. */
export async function startWorkoutLog(data: WorkoutLogStartRequest): Promise<WorkoutLogDetailDto> {
  return request<WorkoutLogDetailDto>("/api/v1/workout-logs/start", {
    method: "POST",
    body: data,
  });
}

/** `GET /api/v1/workout-logs/active` — the user's current in-progress session, or `null`. */
export async function getActiveWorkoutLog(): Promise<WorkoutLogDetailDto | null> {
  return request<WorkoutLogDetailDto | null>("/api/v1/workout-logs/active");
}

/** `GET /api/v1/workout-logs/{id}` — a single logged session, with exercises/sets nested. */
export async function getWorkoutLog(workoutLogId: string): Promise<WorkoutLogDetailDto> {
  return request<WorkoutLogDetailDto>(`/api/v1/workout-logs/${workoutLogId}`);
}

/** `GET /api/v1/workout-logs` — a filtered, paginated page of the user's logged sessions. */
export async function listWorkoutLogHistory(params?: {
  status?: WorkoutLogStatusDto;
  limit?: number;
  offset?: number;
}): Promise<WorkoutLogPageDto> {
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
  return request<WorkoutLogPageDto>(`/api/v1/workout-logs${suffix}`);
}

/** `POST /api/v1/workout-logs/{id}/finish` — complete an in-progress session. */
export async function finishWorkoutLog(
  workoutLogId: string,
  data: WorkoutLogFinishRequest = {},
): Promise<WorkoutLogDetailDto> {
  return request<WorkoutLogDetailDto>(`/api/v1/workout-logs/${workoutLogId}/finish`, {
    method: "POST",
    body: data,
  });
}

/** `POST /api/v1/workout-logs/{id}/skip` — cancel an in-progress session. */
export async function skipWorkoutLog(workoutLogId: string): Promise<WorkoutLogDetailDto> {
  return request<WorkoutLogDetailDto>(`/api/v1/workout-logs/${workoutLogId}/skip`, {
    method: "POST",
  });
}

/** `POST /api/v1/workout-logs/{id}/exercises` — add an ad-hoc exercise instance. */
export async function addWorkoutLogExercise(
  workoutLogId: string,
  data: WorkoutLogExerciseCreateRequest,
): Promise<WorkoutLogExerciseReadDto> {
  return request<WorkoutLogExerciseReadDto>(`/api/v1/workout-logs/${workoutLogId}/exercises`, {
    method: "POST",
    body: data,
  });
}

/** `POST /api/v1/workout-logs/{id}/exercises/{logExerciseId}/skip` — mark an exercise instance as skipped. */
export async function skipWorkoutLogExercise(
  workoutLogId: string,
  logExerciseId: string,
): Promise<WorkoutLogExerciseReadDto> {
  return request<WorkoutLogExerciseReadDto>(
    `/api/v1/workout-logs/${workoutLogId}/exercises/${logExerciseId}/skip`,
    { method: "POST" },
  );
}

/** `POST /api/v1/workout-logs/{id}/exercises/{logExerciseId}/sets` — log a new set. */
export async function logWorkoutSet(
  workoutLogId: string,
  logExerciseId: string,
  data: WorkoutSetLogCreateRequest,
): Promise<WorkoutSetLogReadDto> {
  return request<WorkoutSetLogReadDto>(
    `/api/v1/workout-logs/${workoutLogId}/exercises/${logExerciseId}/sets`,
    { method: "POST", body: data },
  );
}

/** `PATCH /api/v1/workout-logs/{id}/exercises/{logExerciseId}/sets/{setId}` — update a previously logged set. */
export async function updateWorkoutSet(
  workoutLogId: string,
  logExerciseId: string,
  setLogId: string,
  data: WorkoutSetLogUpdateRequest,
): Promise<WorkoutSetLogReadDto> {
  return request<WorkoutSetLogReadDto>(
    `/api/v1/workout-logs/${workoutLogId}/exercises/${logExerciseId}/sets/${setLogId}`,
    { method: "PATCH", body: data },
  );
}

/** `DELETE /api/v1/workout-logs/{id}/exercises/{logExerciseId}/sets/{setId}` — delete a previously logged set. */
export async function deleteWorkoutSet(
  workoutLogId: string,
  logExerciseId: string,
  setLogId: string,
): Promise<void> {
  await request<void>(
    `/api/v1/workout-logs/${workoutLogId}/exercises/${logExerciseId}/sets/${setLogId}`,
    { method: "DELETE" },
  );
}
