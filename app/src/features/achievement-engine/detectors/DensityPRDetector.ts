import { PersonalRecordTypes } from "../models/PersonalRecordType";
import { buildPersonalRecord } from "../utils/buildPersonalRecord";
import { isPersonalRecord } from "./compareBaseline";
import type {
  PersonalRecordDetectionInput,
  PersonalRecordDetector,
} from "./types";

/**
 * Detects Highest Density personal records (tonnage per minute).
 */
export class DensityPRDetector implements PersonalRecordDetector {
  readonly id = "density-pr-detector";

  detect(input: PersonalRecordDetectionInput) {
    const current =
      input.performanceSnapshot.metrics.density.tonnagePerMinute;
    const baseline = input.baselineProvider.getBaseline({
      type: PersonalRecordTypes.HIGHEST_DENSITY,
      athleteId: input.context.athleteId,
    });
    const { isRecord, isFirst } = isPersonalRecord(current, baseline);
    if (!isRecord || current == null) {
      return Object.freeze([]);
    }

    return Object.freeze([
      buildPersonalRecord({
        personalRecordType: PersonalRecordTypes.HIGHEST_DENSITY,
        metricKey: "tonnagePerMinute",
        currentValue: current,
        previousValue: baseline,
        unit: "kg·reps/min",
        isFirst,
        context: input.context,
        evaluatedAt: input.evaluatedAt,
      }),
    ]);
  }
}
