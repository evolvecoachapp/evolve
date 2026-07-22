import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";

export type WorkoutBlockKind =
  | "primary"
  | "secondary"
  | "accessory"
  | "recovery";

export const WORKOUT_BLOCK_KINDS = Object.freeze([
  "primary",
  "secondary",
  "accessory",
  "recovery",
] as const satisfies readonly WorkoutBlockKind[]);

/**
 * Ordered group of exercises within a WorkoutSession.
 * Structural only — no execution tracking.
 */
export interface WorkoutBlock {
  readonly id: string;
  readonly kind: WorkoutBlockKind;
  readonly role: CandidateRole | "recovery";
  readonly order: number;
  readonly label: string;
  readonly exerciseIds: readonly string[];
  readonly estimatedDurationSeconds: number;
}
