import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import {
  CoachInsightTypes,
  CoachTimelineEventCategories,
  collectEvidenceKeys,
  collectIds,
  createSignal,
  entriesByCategory,
  firstDecisionId,
  firstRecommendationId,
  matchesAny,
  textBlob,
  type InsightPatternSignal,
} from "./insightPatternHelpers";

const MISSED_MEAL = Object.freeze([
  /\bmissed (meal|meals)\b/i,
  /\bskip(ped)? (meal|meals)\b/i,
  /\bmeal (miss|skip)/i,
]);

/**
 * Analyze nutrition modification / compliance patterns.
 * One responsibility only.
 */
export function analyzeNutritionPatterns(
  entries: readonly CoachTimelineEntry[],
): readonly InsightPatternSignal[] {
  const signals: InsightPatternSignal[] = [];
  const modifications = entriesByCategory(entries, [
    CoachTimelineEventCategories.NUTRITION_MODIFIED,
  ]);

  if (modifications.length >= 3) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.MODIFICATION_PATTERN,
        domain: "nutrition",
        title: "Repeated nutrition modifications",
        summary: `${modifications.length} nutrition modifications recorded.`,
        reason: "Multiple NUTRITION_MODIFIED timeline entries.",
        impact: "Frequent diet changes may reduce adherence consistency.",
        recommendationAction:
          "Allow the current nutrition version to stabilize for several days.",
        recommendationRationale:
          "Count of nutrition modification events is the sole evidence.",
        expectedOutcome: "Steadier nutrition adherence.",
        evidenceKeys: collectEvidenceKeys(modifications),
        timelineEntryIds: collectIds(modifications),
        signalCount: modifications.length,
        decisionId: firstDecisionId(modifications),
        recommendationId: firstRecommendationId(modifications),
        explanationId: null,
      }),
    );
  }

  const missed = entries.filter((entry) =>
    matchesAny(textBlob(entry), MISSED_MEAL),
  );
  if (missed.length >= 1) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.MISSED_MEALS,
        domain: "nutrition",
        title: "Missed meal pattern",
        summary: `${missed.length} missed-meal signal(s) in the timeline.`,
        reason: "Timeline entries reference missed or skipped meals.",
        impact: "Nutrition plan compliance is incomplete.",
        recommendationAction: "Simplify meal timing before changing macros.",
        recommendationRationale: "Missed-meal language is the sole evidence.",
        expectedOutcome: "Improved meal completion.",
        evidenceKeys: collectEvidenceKeys(missed),
        timelineEntryIds: collectIds(missed),
        signalCount: missed.length,
        decisionId: firstDecisionId(missed),
        recommendationId: firstRecommendationId(missed),
        explanationId: null,
      }),
    );
    signals.push(
      createSignal({
        type: CoachInsightTypes.NUTRITION_COMPLIANCE,
        domain: "nutrition",
        title: "Nutrition compliance concern",
        summary: "Nutrition compliance signals accompany missed meals.",
        reason: "Missed meal evidence implies incomplete nutrition compliance.",
        impact: "Goal support from nutrition may be weaker than planned.",
        recommendationAction: "Prioritize meal adherence over further plan edits.",
        recommendationRationale:
          "Derived only from missed-meal timeline evidence.",
        expectedOutcome: "Higher nutrition plan completion.",
        evidenceKeys: collectEvidenceKeys(missed),
        timelineEntryIds: collectIds(missed),
        signalCount: missed.length,
        decisionId: firstDecisionId(missed),
        recommendationId: firstRecommendationId(missed),
        explanationId: null,
      }),
    );
  }

  return Object.freeze(signals);
}
