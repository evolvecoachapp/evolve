import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { PrescriptionIntensityMetric } from "../../programming/models/PrescriptionIntensity";
import type { PrescriptionTempo } from "../../programming/models/PrescriptionTempo";

/**
 * One working set within an assembled WorkoutExercise.
 * Prescription data only — no completion state.
 */
export interface WorkoutSet {
  readonly setIndex: number;
  readonly repMin: number;
  readonly repMax: number;
  readonly targetRpe: number | null;
  readonly targetRir: number | null;
}

/**
 * Assembled executable exercise prescription for one session.
 * Immutable. No logging. No timers. No completion tracking.
 */
export interface WorkoutExercise {
  readonly id: string;
  readonly exerciseId: string;
  readonly name: string;
  readonly role: CandidateRole;
  /** Absolute execution order within the session (1-based). */
  readonly order: number;
  readonly blockId: string;
  readonly sets: readonly WorkoutSet[];
  readonly setCount: number;
  readonly repMin: number;
  readonly repMax: number;
  readonly intensityMetric: PrescriptionIntensityMetric;
  readonly intensityValue: number | null;
  readonly restSeconds: number;
  readonly betweenSetsRestSeconds: number;
  readonly tempo: PrescriptionTempo | null;
  readonly notes: readonly string[];
  readonly cues: readonly string[];
  readonly appliedRecommendationIds: readonly string[];
  readonly estimatedDurationSeconds: number;
  readonly estimatedWorkload: number;
  readonly fatigueEstimate: number;
  readonly skillEstimate: number;
}
