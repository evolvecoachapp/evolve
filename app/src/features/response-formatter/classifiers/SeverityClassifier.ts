import type { CoachSeverity } from "../models/CoachRecommendation";
import { CoachSeverities } from "../models/CoachRecommendation";

/**
 * Provider-independent severity classifier from free text.
 */
export class SeverityClassifier {
  classify(text: string): CoachSeverity {
    const lower = text.toLowerCase();
    if (
      lower.includes("critical") ||
      lower.includes("emergency") ||
      lower.includes("stop immediately")
    ) {
      return CoachSeverities.CRITICAL;
    }
    if (
      lower.includes("high") ||
      lower.includes("urgent") ||
      lower.includes("severe") ||
      lower.includes("danger")
    ) {
      return CoachSeverities.HIGH;
    }
    if (
      lower.includes("moderate") ||
      lower.includes("medium") ||
      lower.includes("caution") ||
      lower.includes("warning")
    ) {
      return CoachSeverities.MEDIUM;
    }
    if (lower.includes("minor") || lower.includes("low")) {
      return CoachSeverities.LOW;
    }
    return CoachSeverities.INFO;
  }
}

export const severityClassifier = new SeverityClassifier();
