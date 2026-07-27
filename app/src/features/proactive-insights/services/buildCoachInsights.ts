import type { CoachInsight } from "../models/CoachInsight";
import { severityForEvidenceCount } from "../models/CoachInsightSeverity";
import {
  confidenceForSignalCount,
  type InsightPatternSignal,
} from "./insightPatternHelpers";

/**
 * Materialize immutable CoachInsight records from pattern signals.
 * One responsibility only — does not analyze sources.
 */
export function buildCoachInsights(input: {
  readonly athleteId: string;
  readonly signals: readonly InsightPatternSignal[];
  readonly generatedAt: string;
}): readonly CoachInsight[] {
  const insights = input.signals.map((signal, index) => {
    const confidence = confidenceForSignalCount(signal.signalCount);
    const severity = severityForEvidenceCount(signal.signalCount);
    const insight: CoachInsight = Object.freeze({
      id: `insight:${input.athleteId}:${signal.type}:${index}:${input.generatedAt}`,
      athleteId: input.athleteId,
      timestamp: input.generatedAt,
      type: signal.type,
      severity,
      evidence: Object.freeze({
        keys: Object.freeze([...signal.evidenceKeys]),
        timelineEntryIds: Object.freeze([...signal.timelineEntryIds]),
        signalCount: signal.signalCount,
        sourceDomains: Object.freeze([signal.domain]),
        summary: signal.summary,
      }),
      reason: Object.freeze({
        decisionId: signal.decisionId,
        recommendationId: signal.recommendationId,
        explanationId: signal.explanationId,
        reason: signal.reason,
        impact: signal.impact,
        evidenceKeys: Object.freeze([...signal.evidenceKeys]),
      }),
      recommendation: Object.freeze({
        action: signal.recommendationAction,
        rationale: signal.recommendationRationale,
        expectedOutcome: signal.expectedOutcome,
        relatedRecommendationId: signal.recommendationId,
      }),
      confidence,
      relatedTimelineEntryIds: Object.freeze([...signal.timelineEntryIds]),
      affectedDomain: signal.domain,
      expectedOutcome: signal.expectedOutcome,
      title: signal.title,
      summary: signal.summary,
      metadata: Object.freeze({
        signalType: signal.type,
        signalCount: String(signal.signalCount),
      }),
    });
    return insight;
  });

  return Object.freeze(insights);
}
