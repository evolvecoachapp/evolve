import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { HomeCoachCard } from "../models/HomeCoachCard";

export interface BuildCoachCardInput {
  readonly coachingSession?: CoachingSession | null;
}

/**
 * Compose Home coach card from latest Explainable Coaching Session.
 * No duplicated session composition logic.
 */
export function buildCoachCard(
  input: BuildCoachCardInput = {},
): HomeCoachCard {
  const session = input.coachingSession ?? null;

  if (!session) {
    return Object.freeze({
      present: false,
      sessionId: null,
      recommendation: null,
      expectedOutcome: null,
      confidenceLevel: null,
      confidenceScore: null,
      headline: null,
      summary: "No coaching session available.",
    });
  }

  const recommendation = session.recommendationSummary.present
    ? session.recommendationSummary.summary
    : null;

  return Object.freeze({
    present: true,
    sessionId: session.id,
    recommendation,
    expectedOutcome: session.expectedOutcome,
    confidenceLevel: session.confidence.level,
    confidenceScore: session.confidence.score,
    headline: session.summary.headline,
    summary: [
      session.summary.headline,
      recommendation,
      session.expectedOutcome,
    ]
      .filter(Boolean)
      .join(" · "),
  });
}
