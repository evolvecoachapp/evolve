import { PersonalRecordTypes } from "../models/PersonalRecordType";
import { buildPersonalRecord } from "../utils/buildPersonalRecord";
import { isPersonalRecord } from "./compareBaseline";
import type {
  PersonalRecordDetectionInput,
  PersonalRecordDetector,
} from "./types";

/**
 * Detects Highest Completed Sets personal records.
 */
export class CompletedSetsPRDetector implements PersonalRecordDetector {
  readonly id = "completed-sets-pr-detector";

  detect(input: PersonalRecordDetectionInput) {
    const current =
      input.performanceSnapshot.metrics.volume.totalCompletedSets;
    const baseline = input.baselineProvider.getBaseline({
      type: PersonalRecordTypes.HIGHEST_COMPLETED_SETS,
      athleteId: input.context.athleteId,
    });
    const { isRecord, isFirst } = isPersonalRecord(current, baseline);
    if (!isRecord) {
      return Object.freeze([]);
    }

    return Object.freeze([
      buildPersonalRecord({
        personalRecordType: PersonalRecordTypes.HIGHEST_COMPLETED_SETS,
        metricKey: "totalCompletedSets",
        currentValue: current,
        previousValue: baseline,
        unit: "sets",
        isFirst,
        context: input.context,
        evaluatedAt: input.evaluatedAt,
      }),
    ]);
  }
}
