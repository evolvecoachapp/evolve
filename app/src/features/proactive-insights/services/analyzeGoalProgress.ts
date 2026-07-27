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

const STALL_PATTERNS = Object.freeze([
  /\bplateau\b/i,
  /\bstall(ed|ing)?\b/i,
  /\bno progress\b/i,
  /\bstagnat/i,
  /\bunchanged\b/i,
]);

const ACCEL_PATTERNS = Object.freeze([
  /\baccelerat/i,
  /\bahead of\b/i,
  /\bon track\b/i,
  /\bimprov(e|ing|ement)\b/i,
  /\bprogress(ing|ed)?\b/i,
  /\bfaster\b/i,
]);

/**
 * Analyze goal progress patterns from timeline (and optional goal signals).
 * One responsibility only.
 */
export function analyzeGoalProgress(
  entries: readonly CoachTimelineEntry[],
  goalSignals: readonly string[] = Object.freeze([]),
): readonly InsightPatternSignal[] {
  const signals: InsightPatternSignal[] = [];
  const goalEntries = entriesByCategory(entries, [
    CoachTimelineEventCategories.GOAL_PROGRESS,
    CoachTimelineEventCategories.GOAL_CHANGED,
  ]);

  const stallEntries = goalEntries.filter((entry) =>
    matchesAny(textBlob(entry), STALL_PATTERNS),
  );
  const stallFromSignals = goalSignals.filter((signal) =>
    matchesAny(signal.toLowerCase(), STALL_PATTERNS),
  );
  const stallCount = stallEntries.length + stallFromSignals.length;

  if (stallCount >= 2 || (stallEntries.length >= 1 && goalEntries.length >= 2)) {
    const count = Math.max(stallCount, stallEntries.length || 1);
    signals.push(
      createSignal({
        type: CoachInsightTypes.GOAL_STALL,
        domain: "goal",
        title: "Goal progress stall",
        summary: `Goal stall evidence detected across ${count} signals.`,
        reason: "Goal journal entries indicate plateau / stall language.",
        impact: "Progress toward the active goal may have slowed.",
        recommendationAction:
          "Review goal checkpoints and recent training adherence.",
        recommendationRationale:
          "Stall language appears in recorded goal evidence only.",
        expectedOutcome: "Identify whether load, nutrition, or recovery needs adjustment.",
        evidenceKeys: Object.freeze([
          ...collectEvidenceKeys(stallEntries.length > 0 ? stallEntries : goalEntries),
          ...stallFromSignals,
        ]),
        timelineEntryIds: collectIds(
          stallEntries.length > 0 ? stallEntries : goalEntries,
        ),
        signalCount: count,
        decisionId: firstDecisionId(goalEntries),
        recommendationId: firstRecommendationId(goalEntries),
        explanationId: null,
      }),
    );
    signals.push(
      createSignal({
        type: CoachInsightTypes.PLATEAU_RISK,
        domain: "goal",
        title: "Plateau risk",
        summary: "Plateau risk inferred from goal stall evidence.",
        reason: "Repeated stall / plateau signals in the goal timeline.",
        impact: "Continued unchanged stimulus may prolong the plateau.",
        recommendationAction:
          "Consider a planned progression or deload based on existing decisions.",
        recommendationRationale:
          "Recommendation is limited to patterns already journaled.",
        expectedOutcome: "Reduced plateau risk through evidence-based adjustments.",
        evidenceKeys: collectEvidenceKeys(
          stallEntries.length > 0 ? stallEntries : goalEntries,
        ),
        timelineEntryIds: collectIds(
          stallEntries.length > 0 ? stallEntries : goalEntries,
        ),
        signalCount: count,
        decisionId: firstDecisionId(goalEntries),
        recommendationId: firstRecommendationId(goalEntries),
        explanationId: null,
      }),
    );
  }

  const accelEntries = goalEntries.filter((entry) =>
    matchesAny(textBlob(entry), ACCEL_PATTERNS),
  );
  const accelFromSignals = goalSignals.filter((signal) =>
    matchesAny(signal.toLowerCase(), ACCEL_PATTERNS),
  );
  const accelCount = accelEntries.length + accelFromSignals.length;

  if (accelCount >= 2 || (accelEntries.length >= 1 && goalEntries.length >= 2)) {
    const count = Math.max(accelCount, accelEntries.length || 1);
    signals.push(
      createSignal({
        type: CoachInsightTypes.GOAL_ACCELERATION,
        domain: "goal",
        title: "Goal acceleration",
        summary: `Goal acceleration evidence detected across ${count} signals.`,
        reason: "Goal journal entries indicate progress / acceleration language.",
        impact: "The athlete is advancing relative to prior goal checkpoints.",
        recommendationAction: "Maintain the current successful pattern.",
        recommendationRationale:
          "Acceleration language appears in recorded goal evidence only.",
        expectedOutcome: "Continued progress without unsupported changes.",
        evidenceKeys: Object.freeze([
          ...collectEvidenceKeys(
            accelEntries.length > 0 ? accelEntries : goalEntries,
          ),
          ...accelFromSignals,
        ]),
        timelineEntryIds: collectIds(
          accelEntries.length > 0 ? accelEntries : goalEntries,
        ),
        signalCount: count,
        decisionId: firstDecisionId(goalEntries),
        recommendationId: firstRecommendationId(goalEntries),
        explanationId: null,
      }),
    );
  }

  return Object.freeze(signals);
}
