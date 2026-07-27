import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { WeeklyRecommendationReport } from "../models/WeeklyRecommendationReport";

export interface BuildRecommendationReportInput {
  readonly coachingSession?: CoachingSession | null;
  readonly focusForNextWeek?: string | null;
  readonly recommendationTitles?: readonly string[];
  readonly recommendationIds?: readonly string[];
  readonly expectedOutcome?: string | null;
}

/**
 * Compose Weekly Coach Report recommendation section from Explainable Coaching Session.
 * Optionally projects Decision / Recommendation engine outputs already attached to the session.
 * No duplicated recommendation logic.
 */
export function buildRecommendationReport(
  input: BuildRecommendationReportInput = {},
): WeeklyRecommendationReport {
  const session = input.coachingSession ?? null;
  const externalTitles = input.recommendationTitles ?? Object.freeze([]);
  const externalIds = input.recommendationIds ?? Object.freeze([]);

  if (!session && externalTitles.length === 0 && !input.expectedOutcome) {
    return Object.freeze({
      present: false,
      sessionId: null,
      recommendationIds: Object.freeze([]),
      titles: Object.freeze([]),
      recommendationSummary: null,
      expectedOutcome: null,
      focusForNextWeek: null,
      confidenceLevel: null,
      confidenceScore: null,
      summary: "No recommendations for next week.",
    });
  }

  const recommendationIds = Object.freeze([
    ...(session?.recommendationSummary.recommendationIds ?? []),
    ...externalIds,
  ]);
  const titles = Object.freeze([
    ...(session?.recommendationSummary.titles ?? []),
    ...externalTitles,
  ]);
  const recommendationSummary = session?.recommendationSummary.present
    ? session.recommendationSummary.summary
    : titles.length > 0
      ? titles.join(" · ")
      : null;
  const expectedOutcome =
    input.expectedOutcome ?? session?.expectedOutcome ?? null;
  const focusForNextWeek =
    input.focusForNextWeek ??
    recommendationSummary ??
    expectedOutcome ??
    null;

  const parts = [
    recommendationSummary,
    expectedOutcome,
    focusForNextWeek && focusForNextWeek !== recommendationSummary
      ? `Next week focus: ${focusForNextWeek}`
      : null,
  ].filter(Boolean);

  return Object.freeze({
    present: true,
    sessionId: session?.id ?? null,
    recommendationIds,
    titles,
    recommendationSummary,
    expectedOutcome,
    focusForNextWeek,
    confidenceLevel: session?.confidence.level ?? null,
    confidenceScore: session?.confidence.score ?? null,
    summary:
      parts.length > 0
        ? parts.join(" · ")
        : "Recommendations available for next week.",
  });
}
