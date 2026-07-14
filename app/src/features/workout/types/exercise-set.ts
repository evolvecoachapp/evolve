import type { PerceivedDifficulty } from "./common";

/**
 * A single prescribed or logged set within an exercise.
 * Enrichment fields (tempo, velocity, perceived difficulty) are optional
 * so existing prescriptions remain valid without migration.
 */

export interface ExerciseSet {
  id: string;
  setNumber: number;
  targetWeight: number | null;
  targetReps: number | null;
  completedReps: number | null;
  rir: number | null;
  rpe: number | null;
  percentage: number | null;
  restSeconds: number | null;
  completed: boolean;
  /** Eccentric-pause-concentric-pause notation, e.g. "3-1-1-0". */
  tempo?: string | null;
  /** Intentional pause at the bottom or mid-point of a rep, in seconds. */
  pauseSeconds?: number | null;
  /** Target bar velocity in m/s for VBT-enabled prescriptions. */
  velocityTarget?: number | null;
  /** Actual load used when the set was completed (may differ from target). */
  completedWeight?: number | null;
  /** Subjective difficulty reported or inferred post-set. */
  perceivedDifficulty?: PerceivedDifficulty | null;
}
