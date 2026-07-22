import type { WorkoutProgress } from "./WorkoutProgress";
import type { WorkoutRuntimeEvent } from "./WorkoutRuntimeEvent";
import type { WorkoutRuntimeMetrics } from "./WorkoutRuntimeMetrics";
import type { WorkoutRuntimeSummary } from "./WorkoutRuntimeSummary";
import type { WorkoutState } from "./WorkoutState";

/**
 * Immutable terminal outcome of a finished or cancelled workout runtime.
 */
export interface WorkoutResult {
  readonly runtimeId: string;
  readonly sessionId: string;
  readonly finalState: Extract<WorkoutState, "Completed" | "Cancelled">;
  readonly summary: WorkoutRuntimeSummary;
  readonly progress: WorkoutProgress;
  readonly metrics: WorkoutRuntimeMetrics;
  readonly events: readonly WorkoutRuntimeEvent[];
  readonly completedExerciseIds: readonly string[];
  readonly skippedExerciseIds: readonly string[];
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly cancelledAt: string | null;
  readonly frozenAt: string;
}
