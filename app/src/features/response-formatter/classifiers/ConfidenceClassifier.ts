import type { CoachConfidence } from "../models/CoachConfidence";
import {
  CoachConfidenceSources,
  DEFAULT_COACH_CONFIDENCE,
} from "../models/CoachConfidence";
import {
  clampConfidence,
  labelForConfidence,
  parseConfidenceValue,
} from "../utils/confidenceHelpers";
import { freezeConfidence } from "../utils/freezeObjects";

/**
 * Provider-independent confidence classifier.
 */
export class ConfidenceClassifier {
  classify(raw: string | null, fallback: number | null = null): CoachConfidence {
    const explicit = parseConfidenceValue(raw);
    if (explicit !== null) {
      const score = clampConfidence(explicit);
      return freezeConfidence({
        score,
        label: labelForConfidence(score),
        source: CoachConfidenceSources.EXPLICIT,
      });
    }

    if (fallback !== null) {
      const score = clampConfidence(fallback);
      return freezeConfidence({
        score,
        label: labelForConfidence(score),
        source: CoachConfidenceSources.CLASSIFIED,
      });
    }

    return freezeConfidence({ ...DEFAULT_COACH_CONFIDENCE });
  }
}

export const confidenceClassifier = new ConfidenceClassifier();
