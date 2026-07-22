import { PersonalRecordTypes } from "../models/PersonalRecordType";
import { buildPersonalRecord } from "../utils/buildPersonalRecord";
import { isPersonalRecord } from "./compareBaseline";
import type {
  PersonalRecordDetectionInput,
  PersonalRecordDetector,
} from "./types";

/**
 * Detects Highest Weight personal records (session max weight).
 */
export class WeightPRDetector implements PersonalRecordDetector {
  readonly id = "weight-pr-detector";

  detect(input: PersonalRecordDetectionInput) {
    const current =
      input.performanceSnapshot.metrics.intensity.maxWeight;
    const baseline = input.baselineProvider.getBaseline({
      type: PersonalRecordTypes.HIGHEST_WEIGHT,
      athleteId: input.context.athleteId,
    });
    const { isRecord, isFirst } = isPersonalRecord(current, baseline);
    if (!isRecord || current == null) {
      return Object.freeze([]);
    }

    return Object.freeze([
      buildPersonalRecord({
        personalRecordType: PersonalRecordTypes.HIGHEST_WEIGHT,
        metricKey: "maxWeight",
        currentValue: current,
        previousValue: baseline,
        unit: "kg",
        isFirst,
        context: input.context,
        evaluatedAt: input.evaluatedAt,
      }),
    ]);
  }
}
