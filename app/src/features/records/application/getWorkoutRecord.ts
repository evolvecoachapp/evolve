import type { WorkoutRecord } from "../models/WorkoutRecord";
import {
  workoutRecordsRepository,
  type WorkoutRecordsRepository,
} from "../repository";

/** Cross-exercise lifetime personal records via the records repository. */
export function getWorkoutRecord(
  repository: WorkoutRecordsRepository = workoutRecordsRepository,
): Promise<WorkoutRecord> {
  return repository.getWorkoutRecord();
}
