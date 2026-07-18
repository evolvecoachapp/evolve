import type { ExerciseId, ProgressionSchemeId, TrainingExerciseId } from "../types/ids";
import type { SetPrescription } from "./SetPrescription";

/**
 * A single exercise slot within a training day: an ordered reference into
 * the exercise catalogue plus the sets prescribed for it. Referencing the
 * catalogue by `ExerciseId` (instead of embedding an `ExerciseDefinition`)
 * keeps the catalogue and the program structure independently editable.
 */
export interface TrainingExercise {
  readonly id: TrainingExerciseId;
  readonly exerciseId: ExerciseId;
  readonly order: number;
  readonly setPrescriptions: readonly SetPrescription[];
  readonly progressionSchemeId: ProgressionSchemeId | null;
  /** Shared label linking exercises performed back-to-back as a superset. */
  readonly supersetGroup: string | null;
}
