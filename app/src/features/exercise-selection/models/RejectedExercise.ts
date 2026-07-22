import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { SelectionReason } from "./SelectionReason";

/**
 * Exercise considered but rejected by one or more strategies / validators.
 */
export interface RejectedExercise {
  readonly exerciseId: string;
  readonly exercise: ExerciseDefinition | null;
  readonly reasons: readonly SelectionReason[];
}
