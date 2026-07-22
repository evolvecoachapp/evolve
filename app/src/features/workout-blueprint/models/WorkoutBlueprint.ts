import type { TrainingBlock } from "./TrainingBlock";
import type { TrainingFocus } from "./TrainingFocus";
import type { TrainingPriority } from "./TrainingPriority";
import type { WorkoutBlueprintMetadata } from "./WorkoutBlueprintMetadata";
import type { WorkoutConstraint } from "./WorkoutConstraint";
import type { WorkoutDayBlueprint } from "./WorkoutDayBlueprint";
import type { WorkoutSplit } from "./WorkoutSplit";

/**
 * Immutable high-level training blueprint.
 *
 * Decides WHAT workout structure should be built. Never contains exercises,
 * sets, reps, RPE, percentages, progression, or deload prescriptions.
 */
export interface WorkoutBlueprint {
  readonly id: string;
  readonly split: WorkoutSplit;
  readonly priority: TrainingPriority;
  readonly focus: TrainingFocus;
  readonly constraints: readonly WorkoutConstraint[];
  readonly blocks: readonly TrainingBlock[];
  readonly days: readonly WorkoutDayBlueprint[];
  /** Effective weekly training frequency (sessions/week). */
  readonly weeklyFrequency: number;
  readonly metadata: WorkoutBlueprintMetadata;
}
