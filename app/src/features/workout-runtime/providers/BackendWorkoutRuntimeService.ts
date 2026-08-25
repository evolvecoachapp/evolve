import {
  advanceRestDay as requestAdvanceRestDay,
  finishWorkoutLog,
  getActiveWorkoutLog,
  getTodayPreview,
  getWorkoutLog,
  startWorkoutLog,
} from "../../../api/workouts";
import { ApiError } from "../../../api/client";
import { backendWorkoutService } from "../../workout/providers/BackendWorkoutService";
import { WorkoutServiceError } from "../../workout/types/workoutService";
import {
  mapBackendWorkoutToExperienceDto,
  mapWorkoutLogDetailToRuntimeDto,
  titlesForBackendPreview,
} from "../mappers/mapBackendWorkoutToExperienceDto";
import type { WorkoutRuntimeDto } from "../types/workoutRuntimeDto";
import {
  WorkoutRuntimeExperienceError,
  type WorkoutRuntimeExperienceService,
  type WorkoutRuntimeSaveSetInput,
} from "../types/workoutRuntimeService";
import type { WorkoutLogDetailDto, WorkoutPreviewDto } from "../../../types/api";

/**
 * Backend provider — production source of truth for the Workout tab.
 *
 * Reads `GET /api/v1/workout-resolution/today` (which auto-assigns the default
 * program) and executes sessions through `/api/v1/workout-logs`.
 *
 * Session identity is the WorkoutLog id after start — never the template
 * Workout id used for the pre-start prescription preview.
 */

let lastPreview: WorkoutPreviewDto | null = null;

function toWorkoutRuntimeExperienceError(
  error: unknown,
  fallback: string,
): WorkoutRuntimeExperienceError {
  if (error instanceof WorkoutRuntimeExperienceError) {
    return error;
  }
  if (error instanceof WorkoutServiceError) {
    return new WorkoutRuntimeExperienceError(error.message, "backend");
  }
  if (error instanceof ApiError) {
    if (error.status === 503) {
      return new WorkoutRuntimeExperienceError(
        error.message ||
          "The default training program is not configured. Pull to refresh after it is seeded.",
        "backend",
      );
    }
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

function assertProgramAssigned(preview: WorkoutPreviewDto): void {
  if (preview.state !== "no_active_program") {
    return;
  }
  throw new WorkoutRuntimeExperienceError(
    "No active training program is assigned yet. Pull to retry — EVOLVE assigns the default program on first workout load.",
    "backend",
  );
}

async function fetchTodayPreview(): Promise<WorkoutPreviewDto> {
  const preview = await getTodayPreview();
  lastPreview = preview;
  assertProgramAssigned(preview);
  return preview;
}

async function fetchTodayRuntime(): Promise<WorkoutRuntimeDto> {
  const preview = await fetchTodayPreview();
  const activeLog = await resolveActiveLog(preview);
  return mapBackendWorkoutToExperienceDto({ preview, activeLog });
}

function mapLogToRuntime(
  preview: WorkoutPreviewDto,
  log: WorkoutLogDetailDto,
): WorkoutRuntimeDto {
  const { title, subtitle } = titlesForBackendPreview(preview);
  return mapWorkoutLogDetailToRuntimeDto(log, title, subtitle);
}

/** Test-only: drop cached preview between cases so saveSet cannot reuse a stale rest-day title. */
export function resetBackendWorkoutRuntimeServiceForTests(): void {
  lastPreview = null;
}

export const backendWorkoutRuntimeService = {
  providerId: "backend" as const,

  async getRuntime() {
    try {
      return await fetchTodayRuntime();
    } catch (error) {
      throw toWorkoutRuntimeExperienceError(error, "Failed to load workout runtime.");
    }
  },

  async startRuntime() {
    try {
      const preview = await fetchTodayPreview();
      if (preview.state === "rest_day") {
        throw new WorkoutRuntimeExperienceError(
          "Today is a scheduled rest day.",
          "backend",
        );
      }
      if (preview.state !== "training_day" || !preview.workout) {
        throw new WorkoutRuntimeExperienceError(
          "No workout is scheduled to start.",
          "backend",
        );
      }

      const existing = await getActiveWorkoutLog();
      if (existing) {
        return mapLogToRuntime(preview, existing);
      }

      const log = await startWorkoutLog({
        workout_id: preview.workout.id,
        program_assignment_id: preview.assignment_id ?? undefined,
      });
      return mapLogToRuntime(preview, log);
    } catch (error) {
      throw toWorkoutRuntimeExperienceError(error, "Failed to start the workout.");
    }
  },

  async saveSet(input: WorkoutRuntimeSaveSetInput) {
    const runtimeId = input.runtimeId?.trim();
    if (!runtimeId) {
      throw new WorkoutRuntimeExperienceError(
        "A workout session id is required to log a set.",
        "backend",
      );
    }
    if (input.repetitions === null && input.weight === null) {
      throw new WorkoutRuntimeExperienceError(
        "Enter reps or weight to log this set.",
        "backend",
      );
    }

    try {
      const saved = await backendWorkoutService.saveSet({
        sessionId: runtimeId,
        exerciseId: input.exerciseId,
        setId: input.setId,
        completedReps: input.repetitions,
        completedWeight: input.weight,
        rpe: input.rpe,
        completed: true,
      });
      if (!saved) {
        throw new WorkoutRuntimeExperienceError(
          "Enter reps or weight to log this set.",
          "backend",
        );
      }

      const preview = lastPreview ?? (await fetchTodayPreview());
      const log = await getWorkoutLog(runtimeId);
      return mapLogToRuntime(preview, log);
    } catch (error) {
      throw toWorkoutRuntimeExperienceError(error, "Failed to save the logged set.");
    }
  },

  async advanceRestDay() {
    try {
      const preview = await requestAdvanceRestDay();
      lastPreview = preview;
      assertProgramAssigned(preview);
      const activeLog = await resolveActiveLog(preview);
      return mapBackendWorkoutToExperienceDto({ preview, activeLog });
    } catch (error) {
      throw toWorkoutRuntimeExperienceError(error, "Failed to advance past rest day.");
    }
  },

  async finishRuntime(input: {
    readonly runtimeId: string;
    readonly sessionNotes: string;
  }) {
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
} satisfies WorkoutRuntimeExperienceService;

