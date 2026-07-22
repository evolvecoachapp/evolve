import { PersonalRecordTypes } from "../models/PersonalRecordType";
import { buildPersonalRecord } from "../utils/buildPersonalRecord";
import { isPersonalRecord } from "./compareBaseline";
import type {
  PersonalRecordDetectionInput,
  PersonalRecordDetector,
} from "./types";

/**
 * Detects Highest Tonnage personal records.
 */
export class TonnagePRDetector implements PersonalRecordDetector {
  readonly id = "tonnage-pr-detector";

  detect(input: PersonalRecordDetectionInput) {
    const current = input.performanceSnapshot.metrics.volume.tonnage;
    const baseline = input.baselineProvider.getBaseline({
      type: PersonalRecordTypes.HIGHEST_TONNAGE,
      athleteId: input.context.athleteId,
    });
    const { isRecord, isFirst } = isPersonalRecord(current, baseline);
    if (!isRecord) {
      return Object.freeze([]);
    }

    return Object.freeze([
      buildPersonalRecord({
        personalRecordType: PersonalRecordTypes.HIGHEST_TONNAGE,
        metricKey: "tonnage",
        currentValue: current,
        previousValue: baseline,
        unit: "kg·reps",
        isFirst,
        context: input.context,
        evaluatedAt: input.evaluatedAt,
      }),
    ]);
  }
}
