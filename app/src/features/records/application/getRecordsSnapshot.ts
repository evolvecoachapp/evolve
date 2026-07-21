import type { ExerciseRecord } from "../models/ExerciseRecord";
import type { RecordSummary } from "../models/RecordSummary";
import type { WorkoutRecord } from "../models/WorkoutRecord";
import {
  workoutRecordsRepository,
  type WorkoutRecordsRepository,
} from "../repository";

/** Bundled records snapshot for the presentation hook. */
export interface RecordsSnapshot {
  readonly workoutRecord: WorkoutRecord;
  readonly exercises: readonly ExerciseRecord[];
  readonly summary: RecordSummary;
}

export interface GetRecordsSnapshotOptions {
  readonly repository?: WorkoutRecordsRepository;
}

/**
 * Loads overview records in parallel for the `useWorkoutRecords` hook.
 */
export async function getRecordsSnapshot({
  repository = workoutRecordsRepository,
}: GetRecordsSnapshotOptions = {}): Promise<RecordsSnapshot> {
  const [workoutRecord, exercises, summary] = await Promise.all([
    repository.getWorkoutRecord(),
    repository.getExerciseRecords(),
    repository.getRecordSummary(),
  ]);

  return Object.freeze({
    workoutRecord,
    exercises,
    summary,
  });
}
