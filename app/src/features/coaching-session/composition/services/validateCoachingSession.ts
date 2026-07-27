import type { CoachingSession } from "../models/CoachingSession";
import type { CoachingSessionValidation } from "../models/CoachingSessionResult";

function isFrozen(value: unknown): boolean {
  return typeof value === "object" && value !== null && Object.isFrozen(value);
}

/**
 * Validate an explainable coaching session is complete, consistent, and immutable.
 * Rejects partially-built sessions.
 */
export function validateCoachingSession(
  session: CoachingSession | null | undefined,
): CoachingSessionValidation {
  const errors: string[] = [];

  if (!session) {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["Session is missing"]),
    });
  }

  if (!session.id) errors.push("Session id is required");
  if (!session.timestamp) errors.push("Session timestamp is required");
  if (!session.userRequest && session.userRequest !== "") {
    errors.push("Session userRequest is required");
  }
  if (!session.conversationIntent) {
    errors.push("Session conversationIntent is required");
  }
  if (!session.evidenceUsed) errors.push("Session evidenceUsed is required");
  if (!session.timelineReferences) {
    errors.push("Session timelineReferences is required");
  }
  if (!session.decisionSummary) errors.push("Session decisionSummary is required");
  if (!session.recommendationSummary) {
    errors.push("Session recommendationSummary is required");
  }
  if (!session.insightSummary) errors.push("Session insightSummary is required");
  if (!session.reasoningSummary) {
    errors.push("Session reasoningSummary is required");
  }
  if (!session.expectedOutcome) errors.push("Session expectedOutcome is required");
  if (!session.confidence) errors.push("Session confidence is required");
  if (!session.relatedDomains) errors.push("Session relatedDomains is required");
  if (!session.context) errors.push("Session context is required");
  if (!session.summary) errors.push("Session summary is required");
  if (!session.metadata) errors.push("Session metadata is required");

  if (session.evidenceUsed) {
    for (const tid of session.timelineReferences) {
      if (
        !session.evidenceUsed.timelineEntryIds.includes(tid) &&
        session.timelineReferences.length > 0
      ) {
        // Timeline refs may be a superset collected after evidence; require consistency
        // only when evidence lists timeline ids that are missing from references.
      }
    }
    for (const tid of session.evidenceUsed.timelineEntryIds) {
      if (!session.timelineReferences.includes(tid)) {
        errors.push(
          `Timeline reference missing for evidence timeline entry ${tid}`,
        );
      }
    }

    const expectedScore = Math.max(
      0,
      Math.min(
        1,
        Math.round(
          (session.evidenceUsed.items.length * 0.15 +
            session.evidenceUsed.sources.length * 0.1) *
            100,
        ) / 100,
      ),
    );
    if (session.confidence && session.confidence.score !== expectedScore) {
      errors.push("Confidence score does not match evidence calculation");
    }
    if (
      session.confidence &&
      session.confidence.evidenceCount !== session.evidenceUsed.items.length
    ) {
      errors.push("Confidence evidenceCount does not match evidence items");
    }
  }

  if (session.decisionSummary?.present) {
    if (session.decisionSummary.decisionIds.length === 0) {
      // present can be true from titles alone for recommendations; for decisions require ids
      errors.push("Decision summary marked present without decision ids");
    }
  }

  if (!isFrozen(session)) {
    errors.push("Session must be immutable (Object.freeze)");
  }
  if (session.evidenceUsed && !isFrozen(session.evidenceUsed)) {
    errors.push("evidenceUsed must be immutable");
  }
  if (session.confidence && !isFrozen(session.confidence)) {
    errors.push("confidence must be immutable");
  }
  if (session.summary && !isFrozen(session.summary)) {
    errors.push("summary must be immutable");
  }
  if (session.context && !isFrozen(session.context)) {
    errors.push("context must be immutable");
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function assertSessionImmutable(session: CoachingSession): void {
  if (!Object.isFrozen(session)) {
    throw new Error("CoachingSession must be frozen");
  }
}
