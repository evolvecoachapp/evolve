import type { ExerciseRecord } from "../models/ExerciseRecord";
import {
  workoutRecordsRepository,
  type WorkoutRecordsRepository,
} from "../repository";

/** Per-exercise personal records via the records repository. */
export function getExerciseRecords(
  exerciseId?: string,
  repository: WorkoutRecordsRepository = workoutRecordsRepository,
): Promise<readonly ExerciseRecord[]> {
  return repository.getExerciseRecords(exerciseId);
}
