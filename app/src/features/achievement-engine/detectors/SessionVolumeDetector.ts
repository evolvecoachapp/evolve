import { PersonalRecordTypes } from "../models/PersonalRecordType";
import { buildPersonalRecord } from "../utils/buildPersonalRecord";
import { isPersonalRecord } from "./compareBaseline";
import type {
  PersonalRecordDetectionInput,
  PersonalRecordDetector,
} from "./types";

/**
 * Detects Highest Session Volume personal records (session tonnage).
 */
export class SessionVolumeDetector implements PersonalRecordDetector {
  readonly id = "session-volume-detector";

  detect(input: PersonalRecordDetectionInput) {
    const current = input.performanceSnapshot.session.metrics.volume.tonnage;
    const baseline = input.baselineProvider.getBaseline({
      type: PersonalRecordTypes.HIGHEST_SESSION_VOLUME,
      athleteId: input.context.athleteId,
    });
    const { isRecord, isFirst } = isPersonalRecord(current, baseline);
    if (!isRecord) {
      return Object.freeze([]);
    }

    return Object.freeze([
      buildPersonalRecord({
        personalRecordType: PersonalRecordTypes.HIGHEST_SESSION_VOLUME,
        metricKey: "sessionTonnage",
        currentValue: current,
        previousValue: baseline,
        unit: "kg·reps",
        isFirst,
        context: input.context,
        evaluatedAt: input.evaluatedAt,
        attributes: Object.freeze({
          sessionId: input.context.sessionId,
        }),
      }),
    ]);
  }
}
