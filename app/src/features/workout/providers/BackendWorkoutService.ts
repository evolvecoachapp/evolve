import { ApiError } from "../../../api/client";
import {
  deleteWorkoutSet,
  finishWorkoutLog,
  getActiveWorkoutLog,
  getTodayPreview,
  getWorkoutLog,
  getWorkoutTemplate,
  listWorkoutLogHistory,
  logWorkoutSet,
  skipWorkoutLogExercise,
  startWorkoutLog,
  updateWorkoutSet,
} from "../../../api/workouts";
import type { WorkoutPreviewDto, WorkoutResolutionStateDto } from "../../../types/api";
import type { ExerciseHistory } from "../models/ExerciseHistory";
import type { Workout } from "../models/Workout";
import type { WorkoutSession } from "../models/WorkoutSession";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import {
  WorkoutServiceError,
  type SaveSetRequest,
  type SavedSetResult,
  type SkipExerciseRequest,
  type WorkoutService,
} from "../types/workoutService";
import {
  mapPreviewToScheduleLabels,
  mapWorkoutLogDetailToExerciseHistory,
  mapWorkoutLogDetailToWorkoutSession,
  mapWorkoutLogDetailToWorkoutSummary,
  mapWorkoutPublicToWorkout,
  mapWorkoutSetLogToSavedSetResult,
} from "../utils/backendWorkoutAdapters";

/** Display metadata a `WorkoutLog`/`WorkoutSetLog` response doesn't carry itself. */
interface WorkoutDisplayMeta {
  title: string;
  subtitle: string;
}

/** A frontend-generated placeholder set id (`${logExerciseId}-set-${n}`) never yet persisted as a `WorkoutSetLog` row. */
function isPlaceholderSetId(setId: string): boolean {
  return setId.includes("-set-");
}

function describeNonTrainingState(state: WorkoutResolutionStateDto): string {
  switch (state) {
    case "rest_day":
      return "Today is a scheduled rest day.";
    case "program_complete":
      return "You've completed your active training program.";
    case "no_active_program":
      return "No active training program is assigned yet.";
    default:
      return "No workout is scheduled for today.";
  }
}

function toServiceError(error: unknown, fallback: string): WorkoutServiceError {
  if (error instanceof WorkoutServiceError) {
    return error;
  }
  if (error instanceof ApiError) {
    return new WorkoutServiceError(error.message, "backend");
  }
  return new WorkoutServiceError(error instanceof Error ? error.message : fallback, "backend");
}

function createBackendWorkoutService(): WorkoutService {
  /** Title/subtitle for a workout template id, populated by `getTodayWorkout`/`getWorkout`. */
  const workoutDisplayCache = new Map<string, WorkoutDisplayMeta>();
  /** Title/subtitle for a session (workout log) id, populated by `startWorkout`. */
  const sessionDisplayCache = new Map<string, WorkoutDisplayMeta>();
  /** The most recent resolution preview, so `startWorkout` can attach `program_assignment_id` when relevant. */
  let lastPreview: WorkoutPreviewDto | null = null;

  const service: WorkoutService = {
    providerId: "backend",

    async getTodayWorkout(): Promise<Workout> {
      try {
        const preview = await getTodayPreview();
        lastPreview = preview;

        if (preview.state !== "training_day" || !preview.workout) {
          throw new WorkoutServiceError(describeNonTrainingState(preview.state), "backend");
        }

        const title = preview.program?.name ?? preview.workout.name;
        const subtitle = preview.workout.name;
        workoutDisplayCache.set(preview.workout.id, { title, subtitle });

        return mapWorkoutPublicToWorkout(
          preview.workout,
          mapPreviewToScheduleLabels(preview),
          title,
          subtitle,
        );
      } catch (error) {
        throw toServiceError(error, "Failed to load today's workout.");
      }
    },

    async getWorkout(id: string): Promise<Workout | null> {
      try {
        const dto = await getWorkoutTemplate(id);
        workoutDisplayCache.set(dto.id, { title: dto.name, subtitle: dto.name });
        return mapWorkoutPublicToWorkout(
          dto,
          { weekLabel: "This week", dayLabel: "Today" },
          dto.name,
          dto.name,
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw toServiceError(error, `Failed to load workout ${id}.`);
      }
    },

    async getSession(sessionId: string): Promise<WorkoutSession | null> {
      try {
        const dto = await getWorkoutLog(sessionId);
        const meta = sessionDisplayCache.get(sessionId) ?? { title: "Workout", subtitle: "" };
        return mapWorkoutLogDetailToWorkoutSession(dto, meta.title, meta.subtitle);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw toServiceError(error, "Failed to load the workout session.");
      }
    },

    async getActiveSession(): Promise<WorkoutSession | null> {
      try {
        const dto = await getActiveWorkoutLog();
        if (!dto) {
          return null;
        }
        const meta = sessionDisplayCache.get(dto.id) ?? { title: "Workout", subtitle: "" };
        sessionDisplayCache.set(dto.id, meta);
        return mapWorkoutLogDetailToWorkoutSession(dto, meta.title, meta.subtitle);
      } catch (error) {
        throw toServiceError(error, "Failed to load the active workout session.");
      }
    },

    async startWorkout(workoutId: string): Promise<WorkoutSession> {
      try {
        const assignmentId =
          lastPreview?.workout?.id === workoutId ? lastPreview.assignment_id : null;
        const dto = await startWorkoutLog({
          workout_id: workoutId,
          program_assignment_id: assignmentId ?? undefined,
        });

        const meta = workoutDisplayCache.get(workoutId) ?? { title: "Workout", subtitle: "" };
        sessionDisplayCache.set(dto.id, meta);
        return mapWorkoutLogDetailToWorkoutSession(dto, meta.title, meta.subtitle);
      } catch (error) {
        throw toServiceError(error, "Failed to start the workout session.");
      }
    },

    async finishWorkout(sessionId: string): Promise<WorkoutSummary> {
      try {
        const dto = await finishWorkoutLog(sessionId, {});
        const meta = sessionDisplayCache.get(sessionId) ?? { title: "Workout", subtitle: "" };
        sessionDisplayCache.delete(sessionId);
        return mapWorkoutLogDetailToWorkoutSummary(dto, meta.title);
      } catch (error) {
        throw toServiceError(error, "Failed to finish the workout session.");
      }
    },

    async saveSet(request: SaveSetRequest): Promise<SavedSetResult | null> {
      const { sessionId, exerciseId, setId, completedReps, completedWeight, rpe, completed } = request;
      try {
        if (isPlaceholderSetId(setId)) {
          if (!completed || (completedReps === null && completedWeight === null)) {
            return null;
          }
          const dto = await logWorkoutSet(sessionId, exerciseId, {
            weight_kg: completedWeight ?? undefined,
            reps: completedReps ?? undefined,
            rpe: rpe ?? undefined,
          });
          return mapWorkoutSetLogToSavedSetResult(dto);
        }

        if (!completed) {
          await deleteWorkoutSet(sessionId, exerciseId, setId);
          return null;
        }

        const dto = await updateWorkoutSet(sessionId, exerciseId, setId, {
          weight_kg: completedWeight ?? undefined,
          reps: completedReps ?? undefined,
          rpe: rpe ?? undefined,
        });
        return mapWorkoutSetLogToSavedSetResult(dto);
      } catch (error) {
        throw toServiceError(error, "Failed to save the logged set.");
      }
    },

    async skipExercise(request: SkipExerciseRequest): Promise<void> {
      try {
        await skipWorkoutLogExercise(request.sessionId, request.exerciseId);
      } catch (error) {
        throw toServiceError(error, "Failed to skip the exercise.");
      }
    },

    async getHistory(): Promise<ExerciseHistory[]> {
      try {
        const page = await listWorkoutLogHistory({ status: "completed", limit: 20 });
        const details = await Promise.all(page.items.map((item) => getWorkoutLog(item.id)));
        return details.flatMap(mapWorkoutLogDetailToExerciseHistory);
      } catch (error) {
        throw toServiceError(error, "Failed to load workout history.");
      }
    },
  };

  return service;
}

/** Backend provider — talks to the EVOLVE API's Workout Resolution / Workout Log endpoints. */
export const backendWorkoutService: WorkoutService = createBackendWorkoutService();
