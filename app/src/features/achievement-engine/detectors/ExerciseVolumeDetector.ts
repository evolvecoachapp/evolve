import type { PersonalRecord } from "../models/PersonalRecord";
import { PersonalRecordTypes } from "../models/PersonalRecordType";
import { buildPersonalRecord } from "../utils/buildPersonalRecord";
import { isPersonalRecord } from "./compareBaseline";
import type {
  PersonalRecordDetectionInput,
  PersonalRecordDetector,
} from "./types";

/**
 * Detects Highest Exercise Volume personal records (per exercise tonnage).
 */
export class ExerciseVolumeDetector implements PersonalRecordDetector {
  readonly id = "exercise-volume-detector";

  detect(input: PersonalRecordDetectionInput) {
    const records: PersonalRecord[] = [];

    for (const exercise of input.performanceSnapshot.exercises) {
      if (exercise.skipped || !exercise.completed) {
        continue;
      }
      const exerciseKey =
        exercise.exerciseId ?? exercise.exerciseRuntimeId;
      const current = exercise.tonnage;
      const baseline = input.baselineProvider.getBaseline({
        type: PersonalRecordTypes.HIGHEST_EXERCISE_VOLUME,
        exerciseId: exerciseKey,
        athleteId: input.context.athleteId,
      });
      const { isRecord, isFirst } = isPersonalRecord(current, baseline);
      if (!isRecord) {
        continue;
      }

      records.push(
        buildPersonalRecord({
          personalRecordType: PersonalRecordTypes.HIGHEST_EXERCISE_VOLUME,
          metricKey: "exerciseTonnage",
          currentValue: current,
          previousValue: baseline,
          unit: "kg·reps",
          isFirst,
          context: input.context,
          evaluatedAt: input.evaluatedAt,
          exerciseId: exercise.exerciseId,
          exerciseRuntimeId: exercise.exerciseRuntimeId,
          attributes: Object.freeze({
            exerciseRuntimeId: exercise.exerciseRuntimeId,
            ...(exercise.exerciseName
              ? { exerciseName: exercise.exerciseName }
              : {}),
          }),
        }),
      );
    }

    return Object.freeze(records);
  }
}
