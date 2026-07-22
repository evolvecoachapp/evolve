import type { RestRuntime } from "../../rest-runtime/models/RestRuntime";
import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import type { ExerciseRuntime } from "./ExerciseRuntime";
import type { WorkoutProgress } from "./WorkoutProgress";
import type { WorkoutRuntimeConfiguration } from "./WorkoutRuntimeConfiguration";
import type { WorkoutRuntimeEvent } from "./WorkoutRuntimeEvent";
import type { WorkoutRuntimeMetrics } from "./WorkoutRuntimeMetrics";
import type { WorkoutState } from "./WorkoutState";

/**
 * Mutable runtime of an immutable WorkoutSession while it is being performed.
 * Does not modify the source session.
 */
export interface WorkoutRuntime {
  readonly id: string;
  readonly sessionId: string;
  /** Frozen reference to the source assembled session. */
  readonly session: WorkoutSession;
  readonly state: WorkoutState;
  readonly exercises: readonly ExerciseRuntime[];
  readonly currentExerciseIndex: number | null;
  readonly currentExerciseId: string | null;
  readonly currentSetId: string | null;
  readonly completedExerciseIds: readonly string[];
  readonly skippedExerciseIds: readonly string[];
  readonly progress: WorkoutProgress;
  readonly metrics: WorkoutRuntimeMetrics;
  readonly configuration: WorkoutRuntimeConfiguration;
  readonly events: readonly WorkoutRuntimeEvent[];
  /**
   * Optional owned RestRuntime (Sprint 18.1).
   * Workout Runtime may own Rest Runtime; Rest Runtime never imports Workout Runtime.
   */
  readonly restRuntime: RestRuntime | null;
  readonly startedAt: string | null;
  readonly pausedAt: string | null;
  readonly completedAt: string | null;
  readonly cancelledAt: string | null;
}
