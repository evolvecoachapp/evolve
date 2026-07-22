import type { SetState } from "./SetState";

/**
 * Mutable runtime state for one prescribed set.
 * Built from an immutable WorkoutSet; tracks live performance values.
 */
export interface SetRuntime {
  readonly id: string;
  readonly exerciseRuntimeId: string;
  readonly setIndex: number;
  readonly prescribedRepMin: number;
  readonly prescribedRepMax: number;
  readonly prescribedTargetRpe: number | null;
  readonly prescribedTargetRir: number | null;
  readonly state: SetState;
  readonly weight: number | null;
  readonly repetitions: number | null;
  readonly rpe: number | null;
  readonly rir: number | null;
  readonly notes: readonly string[];
  readonly completed: boolean;
}
