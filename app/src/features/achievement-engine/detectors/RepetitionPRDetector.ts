import { PersonalRecordTypes } from "../models/PersonalRecordType";
import { buildPersonalRecord } from "../utils/buildPersonalRecord";
import { isPersonalRecord } from "./compareBaseline";
import type {
  PersonalRecordDetectionInput,
  PersonalRecordDetector,
} from "./types";

/**
 * Detects Highest Repetitions personal records.
 */
export class RepetitionPRDetector implements PersonalRecordDetector {
  readonly id = "repetition-pr-detector";

  detect(input: PersonalRecordDetectionInput) {
    const current =
      input.performanceSnapshot.metrics.volume.totalCompletedRepetitions;
    const baseline = input.baselineProvider.getBaseline({
      type: PersonalRecordTypes.HIGHEST_REPETITIONS,
      athleteId: input.context.athleteId,
    });
    const { isRecord, isFirst } = isPersonalRecord(current, baseline);
    if (!isRecord) {
      return Object.freeze([]);
    }

    return Object.freeze([
      buildPersonalRecord({
        personalRecordType: PersonalRecordTypes.HIGHEST_REPETITIONS,
        metricKey: "totalCompletedRepetitions",
        currentValue: current,
        previousValue: baseline,
        unit: "reps",
        isFirst,
        context: input.context,
        evaluatedAt: input.evaluatedAt,
      }),
    ]);
  }
}
