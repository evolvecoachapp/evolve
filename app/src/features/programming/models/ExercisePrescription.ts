import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { PrescriptionExecution } from "./PrescriptionExecution";
import type { PrescriptionIntensity } from "./PrescriptionIntensity";
import type { PrescriptionRest } from "./PrescriptionRest";
import type { PrescriptionSet } from "./PrescriptionSet";
import type { PrescriptionTempo } from "./PrescriptionTempo";
import type { PrescriptionVolume } from "./PrescriptionVolume";
import type { ProgrammingReason } from "./ProgrammingReason";
import type { ProgrammingScore } from "./ProgrammingScore";

/**
 * Immutable programmed exercise — how one selected candidate should be executed.
 *
 * No progression. No load calculation. No athlete history.
 * No weekly planning. No fatigue adaptation.
 */
export interface ExercisePrescription {
  readonly exerciseId: string;
  readonly exercise: ExerciseDefinition;
  readonly role: CandidateRole;
  /** Selection rank within role (1-based), preserved for ordering. */
  readonly selectionRank: number;
  /** Absolute execution order within the programmed session (1-based). */
  readonly order: number;
  readonly sets: readonly PrescriptionSet[];
  readonly volume: PrescriptionVolume;
  readonly intensity: PrescriptionIntensity;
  readonly rest: PrescriptionRest;
  readonly tempo: PrescriptionTempo | null;
  readonly execution: PrescriptionExecution;
  /** Relative session priority (higher = earlier / more important). */
  readonly priority: number;
  /** Estimated systemic fatigue contribution in [0, 10]. */
  readonly fatigueEstimate: number;
  /** Estimated skill demand in [0, 10]. */
  readonly skillEstimate: number;
  /** Estimated duration for this exercise in seconds. */
  readonly estimatedDurationSeconds: number;
  readonly score: ProgrammingScore;
  readonly reasons: readonly ProgrammingReason[];
}
