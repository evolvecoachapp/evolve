import type { CoachInsight } from "../models/CoachInsight";
import { COACH_INSIGHT_SEVERITY_ORDINAL } from "../models/CoachInsightSeverity";

/**
 * Deterministically prioritize insights by severity, then confidence, then time.
 * One responsibility only.
 */
export function prioritizeInsights(
  insights: readonly CoachInsight[],
): readonly CoachInsight[] {
  const sorted = [...insights].sort((a, b) => {
    const severityDelta =
      COACH_INSIGHT_SEVERITY_ORDINAL[a.severity] -
      COACH_INSIGHT_SEVERITY_ORDINAL[b.severity];
    if (severityDelta !== 0) return severityDelta;
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    if (a.timestamp !== b.timestamp) {
      return a.timestamp < b.timestamp ? 1 : -1;
    }
    return a.id.localeCompare(b.id);
  });
  return Object.freeze(sorted);
}
