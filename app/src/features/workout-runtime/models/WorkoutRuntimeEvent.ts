import type { WorkoutState } from "./WorkoutState";

export type WorkoutRuntimeEventType =
  | "workout_started"
  | "workout_paused"
  | "workout_resumed"
  | "workout_completed"
  | "workout_cancelled"
  | "set_completed"
  | "set_advanced"
  | "exercise_advanced"
  | "exercise_skipped"
  | "exercise_completed";

/**
 * Append-only in-memory runtime event (not telemetry / analytics).
 */
export interface WorkoutRuntimeEvent {
  readonly id: string;
  readonly type: WorkoutRuntimeEventType;
  readonly sequence: number;
  readonly state: WorkoutState;
  readonly exerciseRuntimeId: string | null;
  readonly setRuntimeId: string | null;
  readonly message: string;
  readonly occurredAt: string;
}
