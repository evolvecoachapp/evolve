import type { Exercise } from "./Exercise";
import type { ExerciseSet } from "./ExerciseSet";

/** An exercise prescription within a workout, split into warmup and working sets. */
export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  order: number;
  warmupSets: ExerciseSet[];
  workingSets: ExerciseSet[];
  notes: string | null;
  skipped?: boolean;
}
