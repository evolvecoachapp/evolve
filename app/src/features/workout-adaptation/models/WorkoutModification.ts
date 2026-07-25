import type { WorkoutMetadata } from "./WorkoutMetadata";

export const WorkoutModificationKinds = {
  ADJUSTMENT: "adjustment",
  REPLACEMENT: "replacement",
  INSERTION: "insertion",
  REMOVAL: "removal",
} as const;

export type WorkoutModificationKind =
  (typeof WorkoutModificationKinds)[keyof typeof WorkoutModificationKinds];

export interface WorkoutModification {
  readonly id: string;
  readonly kind: WorkoutModificationKind;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
