import type { MuscleGroup } from "../enums/MuscleGroup";
import type { TrainingDayId } from "../types/ids";
import type { TrainingExercise } from "./TrainingExercise";

/**
 * A single day within a training split: either a rest day or an ordered
 * list of exercises. Days only make sense in the context of a split, so
 * they are embedded there rather than referenced by id.
 */
export interface TrainingDay {
  readonly id: TrainingDayId;
  readonly dayIndex: number;
  readonly name: string;
  readonly isRestDay: boolean;
  readonly primaryFocus: readonly MuscleGroup[];
  readonly exercises: readonly TrainingExercise[];
}
