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
  type InsightPatternSignal,
} from "./insightPatternHelpers";

/**
 * Analyze timeline-wide coaching patterns. One responsibility only.
 */
export function analyzeTimeline(
  entries: readonly CoachTimelineEntry[],
): readonly InsightPatternSignal[] {
  const signals: InsightPatternSignal[] = [];

  const restores = entriesByCategory(entries, [
    CoachTimelineEventCategories.WORKOUT_RESTORED,
    CoachTimelineEventCategories.NUTRITION_RESTORED,
  ]);
  if (restores.length >= 2) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.RESTORE_PATTERN,
        domain: "program",
        title: "Repeated plan restores",
        summary: `${restores.length} plan restores detected in the Coach Timeline.`,
        reason: "Multiple restore events indicate oscillation between plan versions.",
        impact: "Training continuity may be disrupted by frequent undo cycles.",
        recommendationAction:
          "Stabilize on one plan version before further modifications.",
        recommendationRationale:
          "Evidence shows repeated restores rather than sustained adaptation.",
        expectedOutcome: "Fewer restores and steadier progression.",
        evidenceKeys: collectEvidenceKeys(restores),
        timelineEntryIds: collectIds(restores),
        signalCount: restores.length,
        decisionId: firstDecisionId(restores),
        recommendationId: firstRecommendationId(restores),
        explanationId: null,
      }),
    );
  }

  const decisions = entriesByCategory(entries, [
    CoachTimelineEventCategories.COACH_DECISION,
  ]);
  const created = entriesByCategory(entries, [
    CoachTimelineEventCategories.WORKOUT_CREATED,
    CoachTimelineEventCategories.NUTRITION_CREATED,
  ]);
  const modified = entriesByCategory(entries, [
    CoachTimelineEventCategories.WORKOUT_MODIFIED,
    CoachTimelineEventCategories.NUTRITION_MODIFIED,
  ]);
  if (created.length >= 1 && modified.length === 0 && decisions.length >= 1) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.PROGRAM_CONSISTENCY,
        domain: "program",
        title: "Program consistency",
        summary:
          "Plans were created and coach decisions applied without repeated modifications.",
        reason: "Timeline shows create + decision activity without modification churn.",
        impact: "Athlete is following a stable program structure.",
        recommendationAction: "Continue the current program block.",
        recommendationRationale:
          "Consistency evidence supports staying the course.",
        expectedOutcome: "Sustained adherence and measurable progress.",
        evidenceKeys: collectEvidenceKeys([...created, ...decisions]),
        timelineEntryIds: collectIds([...created, ...decisions]),
        signalCount: created.length + decisions.length,
        decisionId: firstDecisionId(decisions),
        recommendationId: firstRecommendationId(decisions),
        explanationId: null,
      }),
    );
  }

  const goalEntries = entriesByCategory(entries, [
    CoachTimelineEventCategories.GOAL_PROGRESS,
    CoachTimelineEventCategories.GOAL_CHANGED,
  ]);
  if (goalEntries.length >= 4) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.LONG_TERM_PROGRESS,
        domain: "goal",
        title: "Long-term goal tracking",
        summary: `${goalEntries.length} goal timeline entries indicate ongoing goal evaluation.`,
        reason: "Repeated goal journal entries show sustained progress monitoring.",
        impact: "Long-term coaching context is available for planning.",
        recommendationAction: "Review the latest goal summary with the athlete.",
        recommendationRationale:
          "Sufficient goal evidence exists to discuss multi-week trends.",
        expectedOutcome: "Clearer long-term direction without inventing metrics.",
        evidenceKeys: collectEvidenceKeys(goalEntries),
        timelineEntryIds: collectIds(goalEntries),
        signalCount: goalEntries.length,
        decisionId: firstDecisionId(goalEntries),
        recommendationId: firstRecommendationId(goalEntries),
        explanationId: null,
      }),
    );
  }

  return Object.freeze(signals);
}
