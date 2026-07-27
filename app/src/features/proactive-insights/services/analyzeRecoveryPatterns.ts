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

const DECLINE = Object.freeze([
  /\bdeclin/i,
  /\bfatigue\b/i,
  /\bworse\b/i,
  /\breadiness.{0,20}\b(low|poor|down)\b/i,
  /\breduce.{0,40}\b(load|volume|intensity)\b/i,
]);

const IMPROVE = Object.freeze([
  /\bimprov/i,
  /\bbetter\b/i,
  /\breadiness.{0,20}\b(high|good|up)\b/i,
  /\brecover(y|ed|ing)\b/i,
]);

/**
 * Analyze recovery / fatigue patterns from timeline.
 * One responsibility only.
 */
export function analyzeRecoveryPatterns(
  entries: readonly CoachTimelineEntry[],
): readonly InsightPatternSignal[] {
  const signals: InsightPatternSignal[] = [];

  const fatigue = entriesByCategory(entries, [
    CoachTimelineEventCategories.FATIGUE_DETECTED,
  ]);
  if (fatigue.length >= 2) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.FATIGUE_PATTERN,
        domain: "recovery",
        title: "Fatigue pattern",
        summary: `${fatigue.length} fatigue detections recorded.`,
        reason: "Multiple FATIGUE_DETECTED timeline entries.",
        impact: "Accumulated fatigue is visible in the coaching journal.",
        recommendationAction:
          "Favor recovery-aligned decisions already present in the timeline.",
        recommendationRationale:
          "Fatigue count is taken only from journaled detections.",
        expectedOutcome: "Reduced fatigue accumulation.",
        evidenceKeys: collectEvidenceKeys(fatigue),
        timelineEntryIds: collectIds(fatigue),
        signalCount: fatigue.length,
        decisionId: firstDecisionId(fatigue),
        recommendationId: firstRecommendationId(fatigue),
        explanationId: null,
      }),
    );
  }

  const recoveryAdj = entriesByCategory(entries, [
    CoachTimelineEventCategories.RECOVERY_ADJUSTMENT,
  ]);
  const decline = [
    ...recoveryAdj.filter((entry) => matchesAny(textBlob(entry), DECLINE)),
    ...fatigue,
  ];
  const uniqueDeclineIds = new Set(decline.map((e) => e.id));
  const declineEntries = decline.filter(
    (entry, index, arr) =>
      arr.findIndex((other) => other.id === entry.id) === index,
  );

  if (uniqueDeclineIds.size >= 2) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.RECOVERY_DECLINE,
        domain: "recovery",
        title: "Recovery decline",
        summary: `${uniqueDeclineIds.size} recovery-decline signals detected.`,
        reason:
          "Recovery adjustments and/or fatigue detections indicate declining readiness.",
        impact: "Training quality may suffer if load stays high.",
        recommendationAction:
          "Apply existing recovery adjustments before adding intensity.",
        recommendationRationale:
          "Only decline language and fatigue entries are cited.",
        expectedOutcome: "Stabilized recovery trajectory.",
        evidenceKeys: collectEvidenceKeys(declineEntries),
        timelineEntryIds: collectIds(declineEntries),
        signalCount: uniqueDeclineIds.size,
        decisionId: firstDecisionId(declineEntries),
        recommendationId: firstRecommendationId(declineEntries),
        explanationId: null,
      }),
    );

    if (fatigue.length >= 2 && volumeHints(entries) >= 1) {
      signals.push(
        createSignal({
          type: CoachInsightTypes.OVERREACH_RISK,
          domain: "recovery",
          title: "Overreach risk",
          summary:
            "Fatigue pattern combined with training load signals indicates overreach risk.",
          reason:
            "Fatigue detections coexist with volume/intensity coaching activity.",
          impact: "Continued high stimulus may worsen recovery.",
          recommendationAction:
            "Respect recovery adjustments already journaled.",
          recommendationRationale:
            "Risk composed only from fatigue + load-related timeline evidence.",
          expectedOutcome: "Lower overreach risk.",
          evidenceKeys: collectEvidenceKeys([...fatigue, ...recoveryAdj]),
          timelineEntryIds: collectIds([...fatigue, ...recoveryAdj]),
          signalCount: fatigue.length + recoveryAdj.length,
          decisionId: firstDecisionId([...fatigue, ...recoveryAdj]),
          recommendationId: firstRecommendationId([...fatigue, ...recoveryAdj]),
          explanationId: null,
        }),
      );
    }
  }

  const improve = recoveryAdj.filter((entry) =>
    matchesAny(textBlob(entry), IMPROVE),
  );
  if (improve.length >= 2) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.RECOVERY_IMPROVEMENT,
        domain: "recovery",
        title: "Recovery improvement",
        summary: `${improve.length} recovery-improvement signals detected.`,
        reason: "Recovery adjustments reference improved readiness.",
        impact: "Recovery trajectory is improving per journaled evidence.",
        recommendationAction: "Maintain the recovery strategy that is working.",
        recommendationRationale:
          "Improvement language appears only in recovery adjustments.",
        expectedOutcome: "Continued recovery gains.",
        evidenceKeys: collectEvidenceKeys(improve),
        timelineEntryIds: collectIds(improve),
        signalCount: improve.length,
        decisionId: firstDecisionId(improve),
        recommendationId: firstRecommendationId(improve),
        explanationId: null,
      }),
    );
  }

  return Object.freeze(signals);
}

function volumeHints(entries: readonly CoachTimelineEntry[]): number {
  return entries.filter((entry) =>
    /\b(volume|intensity|load|workout_modified|coach_decision)\b/i.test(
      textBlob(entry),
    ),
  ).length;
}
