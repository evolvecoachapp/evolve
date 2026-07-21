import type { RecordSummary } from "../models/RecordSummary";
import {
  workoutRecordsRepository,
  type WorkoutRecordsRepository,
} from "../repository";

/** Lifetime record statistics via the records repository. */
export function getRecordSummary(
  repository: WorkoutRecordsRepository = workoutRecordsRepository,
): Promise<RecordSummary> {
  return repository.getRecordSummary();
}
