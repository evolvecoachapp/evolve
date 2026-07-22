import { PersonalRecordTypes } from "../models/PersonalRecordType";
import { buildPersonalRecord } from "../utils/buildPersonalRecord";
import { isPersonalRecord } from "./compareBaseline";
import type {
  PersonalRecordDetectionInput,
  PersonalRecordDetector,
} from "./types";

/**
 * Detects Highest Volume personal records (volumeLoad).
 */
export class VolumePRDetector implements PersonalRecordDetector {
  readonly id = "volume-pr-detector";

  detect(input: PersonalRecordDetectionInput) {
    const current = input.performanceSnapshot.metrics.volume.volumeLoad;
    const baseline = input.baselineProvider.getBaseline({
      type: PersonalRecordTypes.HIGHEST_VOLUME,
      athleteId: input.context.athleteId,
    });
    const { isRecord, isFirst } = isPersonalRecord(current, baseline);
    if (!isRecord) {
      return Object.freeze([]);
    }

    return Object.freeze([
      buildPersonalRecord({
        personalRecordType: PersonalRecordTypes.HIGHEST_VOLUME,
        metricKey: "volumeLoad",
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
