import type { WorkoutModificationKind } from "./WorkoutModificationKind";

/**
 * One immutable description of what changed on the WorkoutPlan.
 */
export interface WorkoutModificationChange {
  readonly id: string;
  readonly kind: WorkoutModificationKind;
  readonly summary: string;
  readonly fieldPath: string;
  readonly previousValue: string;
  readonly nextValue: string;
  readonly preserved: readonly string[];
}
