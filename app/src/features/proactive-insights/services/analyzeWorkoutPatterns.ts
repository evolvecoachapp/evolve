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

const VOLUME_DOWN = Object.freeze([
  /\b(reduce|lower|cut|decrease|less).{0,40}\bvolume\b/i,
  /\bvolume.{0,40}\b(reduc|lower|cut|decreas)/i,
]);

const INTENSITY_CHANGE = Object.freeze([
  /\b(reduce|lower|increase|raise).{0,40}\bintensity\b/i,
  /\bintensity\b/i,
]);

const MISSED_SESSION = Object.freeze([
  /\bmissed (session|workout|training)\b/i,
  /\bskip(ped)? (session|workout)\b/i,
  /\bno[- ]show\b/i,
]);

const PREFERENCE = Object.freeze([
  /\bprefer(ence|red)?\b/i,
  /\blike(d|s)? (the )?(previous|prior|old)\b/i,
  /\bdislike\b/i,
]);

/**
 * Analyze workout modification / volume / compliance patterns.
 * One responsibility only.
 */
export function analyzeWorkoutPatterns(
  entries: readonly CoachTimelineEntry[],
): readonly InsightPatternSignal[] {
  const signals: InsightPatternSignal[] = [];
  const modifications = entriesByCategory(entries, [
    CoachTimelineEventCategories.WORKOUT_MODIFIED,
  ]);

  if (modifications.length >= 3) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.MODIFICATION_PATTERN,
        domain: "workout",
        title: "Repeated workout modifications",
        summary: `${modifications.length} workout modifications recorded.`,
        reason: "Multiple WORKOUT_MODIFIED timeline entries.",
        impact: "Frequent surgical changes may fragment progression.",
        recommendationAction:
          "Batch related changes and allow a block to stabilize.",
        recommendationRationale:
          "Count of modification events is the sole evidence.",
        expectedOutcome: "Fewer mid-block disruptions.",
        evidenceKeys: collectEvidenceKeys(modifications),
        timelineEntryIds: collectIds(modifications),
        signalCount: modifications.length,
        decisionId: firstDecisionId(modifications),
        recommendationId: firstRecommendationId(modifications),
        explanationId: null,
      }),
    );
  }

  const volumeDown = modifications.filter((entry) =>
    matchesAny(textBlob(entry), VOLUME_DOWN),
  );
  if (volumeDown.length >= 2) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.TRAINING_VOLUME,
        domain: "workout",
        title: "Volume reduction pattern",
        summary: `${volumeDown.length} volume-reduction modifications detected.`,
        reason: "Workout modifications reference reduced volume.",
        impact: "Training volume has been lowered repeatedly.",
        recommendationAction:
          "Confirm whether volume cuts align with recovery decisions.",
        recommendationRationale:
          "Only volume-reduction language in timeline is cited.",
        expectedOutcome: "Clearer volume plan without inventing loads.",
        evidenceKeys: collectEvidenceKeys(volumeDown),
        timelineEntryIds: collectIds(volumeDown),
        signalCount: volumeDown.length,
        decisionId: firstDecisionId(volumeDown),
        recommendationId: firstRecommendationId(volumeDown),
        explanationId: null,
      }),
    );
  }

  const intensity = modifications.filter((entry) =>
    matchesAny(textBlob(entry), INTENSITY_CHANGE),
  );
  if (intensity.length >= 2) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.TRAINING_INTENSITY,
        domain: "workout",
        title: "Training intensity pattern",
        summary: `${intensity.length} intensity-related modifications detected.`,
        reason: "Workout modifications reference intensity adjustments.",
        impact: "Session intensity is being actively managed.",
        recommendationAction: "Keep intensity changes tied to readiness evidence.",
        recommendationRationale:
          "Intensity language appears only in journaled modifications.",
        expectedOutcome: "Intensity aligned with recovery capacity.",
        evidenceKeys: collectEvidenceKeys(intensity),
        timelineEntryIds: collectIds(intensity),
        signalCount: intensity.length,
        decisionId: firstDecisionId(intensity),
        recommendationId: firstRecommendationId(intensity),
        explanationId: null,
      }),
    );
  }

  const missed = entries.filter((entry) =>
    matchesAny(textBlob(entry), MISSED_SESSION),
  );
  if (missed.length >= 1) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.MISSED_SESSIONS,
        domain: "workout",
        title: "Missed session pattern",
        summary: `${missed.length} missed-session signal(s) in the timeline.`,
        reason: "Timeline entries reference missed or skipped sessions.",
        impact: "Compliance with the planned workout schedule is incomplete.",
        recommendationAction: "Address scheduling barriers before adding volume.",
        recommendationRationale: "Missed-session language is the sole evidence.",
        expectedOutcome: "Improved session attendance.",
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
        type: CoachInsightTypes.WORKOUT_COMPLIANCE,
        domain: "workout",
        title: "Workout compliance concern",
        summary: "Workout compliance signals accompany missed sessions.",
        reason: "Missed session evidence implies incomplete workout compliance.",
        impact: "Program outcomes may lag planned progression.",
        recommendationAction: "Prioritize adherence over new adaptations.",
        recommendationRationale:
          "Derived only from missed-session timeline evidence.",
        expectedOutcome: "Higher workout completion rate.",
        evidenceKeys: collectEvidenceKeys(missed),
        timelineEntryIds: collectIds(missed),
        signalCount: missed.length,
        decisionId: firstDecisionId(missed),
        recommendationId: firstRecommendationId(missed),
        explanationId: null,
      }),
    );
  }

  const preference = modifications.filter((entry) =>
    matchesAny(textBlob(entry), PREFERENCE),
  );
  if (preference.length >= 2) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.PREFERENCE_PATTERN,
        domain: "workout",
        title: "Preference pattern",
        summary: `${preference.length} preference-linked workout changes detected.`,
        reason: "Modifications reference athlete preference language.",
        impact: "Plan shape is being steered by stated preferences.",
        recommendationAction: "Capture stable preferences to reduce churn.",
        recommendationRationale:
          "Preference language appears only in journaled modifications.",
        expectedOutcome: "Fewer preference-driven mid-block edits.",
        evidenceKeys: collectEvidenceKeys(preference),
        timelineEntryIds: collectIds(preference),
        signalCount: preference.length,
        decisionId: firstDecisionId(preference),
        recommendationId: firstRecommendationId(preference),
        explanationId: null,
      }),
    );
  }

  if (volumeDown.length >= 2 && missed.length >= 1) {
    signals.push(
      createSignal({
        type: CoachInsightTypes.UNDERTRAINING_RISK,
        domain: "workout",
        title: "Undertraining risk",
        summary:
          "Volume reductions combined with missed sessions indicate undertraining risk.",
        reason: "Both volume-down and missed-session evidence are present.",
        impact: "Stimulus may fall below the level needed for progress.",
        recommendationAction:
          "Restore attendance first, then reassess volume with existing decisions.",
        recommendationRationale:
          "Risk is composed only from journaled volume and miss signals.",
        expectedOutcome: "Adequate training stimulus restored.",
        evidenceKeys: collectEvidenceKeys([...volumeDown, ...missed]),
        timelineEntryIds: collectIds([...volumeDown, ...missed]),
        signalCount: volumeDown.length + missed.length,
        decisionId: firstDecisionId([...volumeDown, ...missed]),
        recommendationId: firstRecommendationId([...volumeDown, ...missed]),
        explanationId: null,
      }),
    );
  }

  return Object.freeze(signals);
}
