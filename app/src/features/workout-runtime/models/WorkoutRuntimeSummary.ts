import type { WorkoutProgress } from "./WorkoutProgress";
import type { WorkoutState } from "./WorkoutState";

/**
 * Public snapshot of an active (or terminal) workout runtime.
 * Safe to expose from the application layer.
 */
export interface WorkoutRuntimeSummary {
  readonly runtimeId: string;
  readonly sessionId: string;
  readonly sessionName: string;
  readonly state: WorkoutState;
  readonly currentExerciseId: string | null;
  readonly currentExerciseName: string | null;
  readonly currentSetIndex: number | null;
  readonly progress: WorkoutProgress;
  readonly completedExerciseCount: number;
  readonly skippedExerciseCount: number;
  readonly eventCount: number;
  readonly startedAt: string | null;
  readonly pausedAt: string | null;
}
