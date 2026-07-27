import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { DailyBriefCoachMessage } from "../models/DailyBriefCoachMessage";

export interface BuildCoachMessageInput {
  readonly coachingSession?: CoachingSession | null;
  readonly timelineEntries?: readonly CoachTimelineEntry[];
}

/**
 * Compose Daily Brief coach message from Explainable Coaching Session + Timeline.
 * Not a chat reply. No duplicated session composition logic.
 */
export function buildCoachMessage(
  input: BuildCoachMessageInput = {},
): DailyBriefCoachMessage {
  const session = input.coachingSession ?? null;
  const entries = input.timelineEntries ?? Object.freeze([]);

  const latestTimeline = [...entries].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  )[0];
  const timelineSummary = latestTimeline?.summary ?? null;

  if (!session && !timelineSummary) {
    return Object.freeze({
      present: false,
      sessionId: null,
      headline: null,
      recommendation: null,
      expectedOutcome: null,
      confidenceLevel: null,
      confidenceScore: null,
      timelineSummary: null,
      message: "No coaching message available.",
    });
  }

  if (!session) {
    return Object.freeze({
      present: true,
      sessionId: null,
      headline: null,
      recommendation: null,
      expectedOutcome: null,
      confidenceLevel: null,
      confidenceScore: null,
      timelineSummary,
      message: timelineSummary ?? "Timeline update available.",
    });
  }

  const recommendation = session.recommendationSummary.present
    ? session.recommendationSummary.summary
    : null;

  const parts = [
    session.summary.headline,
    recommendation,
    session.expectedOutcome,
    timelineSummary,
  ].filter(Boolean);

  return Object.freeze({
    present: true,
    sessionId: session.id,
    headline: session.summary.headline,
    recommendation,
    expectedOutcome: session.expectedOutcome,
    confidenceLevel: session.confidence.level,
    confidenceScore: session.confidence.score,
    timelineSummary,
    message:
      parts.length > 0
        ? parts.join(" · ")
        : "Coaching guidance available.",
  });
}
