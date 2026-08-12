import {
  finishWorkoutLog,
  getActiveWorkoutLog,
  getTodayPreview,
  getWorkoutLog,
} from "../../../api/workouts";
import { ApiError } from "../../../api/client";
import { mapBackendWorkoutToExperienceDto } from "../mappers/mapBackendWorkoutToExperienceDto";
import type { WorkoutRuntimeDto } from "../types/workoutRuntimeDto";
import {
  WorkoutRuntimeExperienceError,
  type WorkoutRuntimeExperienceService,
} from "../types/workoutRuntimeService";
import type { WorkoutLogDetailDto, WorkoutPreviewDto } from "../../../types/api";

/**
 * Backend provider — talks to the already-implemented Workout FastAPI surface
 * (`/api/v1/workout-resolution`, `/api/v1/workout-logs`) via the shared
 * authenticated API client.
 *
 * Supported:
 * - Runtime read via today's resolution preview + active/in-progress log
 * - Workout completion via `POST /workout-logs/{id}/finish`
 *
 * Explicitly unsupported on this Experience contract (no matching methods /
 * no matching writable API for the Experience surface):
 * - Set completion / set CRUD mid-session (catalog `BackendWorkoutService`)
 * - Rest-timer persistence
 * - Exercise substitutions
 * - Workout analytics / auto-PRs
 * - Day navigation beyond "today"
 *
 * Production UI remains hydration/runtime-driven; this provider is activated
 * only when `EXPO_PUBLIC_WORKOUT_RUNTIME_PROVIDER=backend` (additive, same
 * pattern as Nutrition/Recovery Experience backends).
 */

function toWorkoutRuntimeExperienceError(
  error: unknown,
  fallback: string,
): WorkoutRuntimeExperienceError {
  if (error instanceof WorkoutRuntimeExperienceError) {
    return error;
  }
  if (error instanceof ApiError) {
    return new WorkoutRuntimeExperienceError(error.message, "backend");
  }
  return new WorkoutRuntimeExperienceError(
    error instanceof Error ? error.message : fallback,
    "backend",
  );
}

async function resolveActiveLog(
  preview: WorkoutPreviewDto,
): Promise<WorkoutLogDetailDto | null> {
  const active = await getActiveWorkoutLog();
  if (active) {
    return active;
  }

  if (preview.active_workout_log_id) {
    try {
      return await getWorkoutLog(preview.active_workout_log_id);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  return null;
}

async function fetchTodayRuntime(): Promise<WorkoutRuntimeDto> {
  const preview = await getTodayPreview();
  const activeLog = await resolveActiveLog(preview);
  return mapBackendWorkoutToExperienceDto({ preview, activeLog });
}

export const backendWorkoutRuntimeService: WorkoutRuntimeExperienceService = {
  providerId: "backend",

  async getRuntime() {
    try {
      return await fetchTodayRuntime();
    } catch (error) {
      throw toWorkoutRuntimeExperienceError(error, "Failed to load workout runtime.");
    }
  },

  async finishRuntime(input) {
    const runtimeId = input.runtimeId?.trim();
    if (!runtimeId) {
      throw new WorkoutRuntimeExperienceError(
        "A workout session id is required to finish the workout.",
        "backend",
      );
    }

    try {
      await finishWorkoutLog(runtimeId, {
        notes: input.sessionNotes.trim() ? input.sessionNotes : undefined,
      });
    } catch (error) {
      throw toWorkoutRuntimeExperienceError(error, "Failed to finish the workout.");
    }
  },
};
