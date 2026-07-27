import type { DailyBrief } from "../models/DailyBrief";
import type { DailyBriefValidation } from "../models/DailyBriefResult";

function isFrozen(value: unknown): boolean {
  return typeof value === "object" && value !== null && Object.isFrozen(value);
}

/**
 * Validate a Daily Brief is complete, consistent, and immutable.
 */
export function validateDailyBrief(
  brief: DailyBrief | null | undefined,
): DailyBriefValidation {
  const errors: string[] = [];

  if (!brief) {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["Daily brief is missing"]),
    });
  }

  if (!brief.id) errors.push("Brief id is required");
  if (!brief.athleteId) errors.push("Brief athleteId is required");
  if (!brief.timestamp) errors.push("Brief timestamp is required");
  if (!brief.summary) errors.push("Brief summary is required");
  if (!brief.workout) errors.push("Brief workout section is required");
  if (!brief.nutrition) errors.push("Brief nutrition section is required");
  if (!brief.recovery) errors.push("Brief recovery section is required");
  if (!brief.goals) errors.push("Brief goals section is required");
  if (!brief.insights) errors.push("Brief insights section is required");
  if (!brief.coachMessage) errors.push("Brief coach message is required");
  if (!brief.priority) errors.push("Brief priority is required");
  if (!brief.confidence) errors.push("Brief confidence is required");
  if (!brief.relatedDomains) errors.push("Brief relatedDomains are required");
  if (!brief.metadata) errors.push("Brief metadata is required");

  if (brief.summary) {
    if (brief.summary.athleteId !== brief.athleteId) {
      errors.push("Summary athleteId must match brief athleteId");
    }
    if (brief.summary.insightCount !== brief.insights.items.length) {
      errors.push("Summary insightCount must match insights items length");
    }
    if (brief.summary.priority !== brief.priority) {
      errors.push("Summary priority must match brief priority");
    }
    if (brief.summary.confidence.score !== brief.confidence.score) {
      errors.push("Summary confidence must match brief confidence");
    }
    if (!isFrozen(brief.summary)) {
      errors.push("summary must be immutable");
    }
  }

  if (brief.workout && !isFrozen(brief.workout)) {
    errors.push("workout section must be immutable");
  }
  if (brief.nutrition && !isFrozen(brief.nutrition)) {
    errors.push("nutrition section must be immutable");
  }
  if (brief.recovery && !isFrozen(brief.recovery)) {
    errors.push("recovery section must be immutable");
  }
  if (brief.goals && !isFrozen(brief.goals)) {
    errors.push("goals section must be immutable");
  }
  if (brief.insights && !isFrozen(brief.insights)) {
    errors.push("insights section must be immutable");
  }
  if (brief.coachMessage && !isFrozen(brief.coachMessage)) {
    errors.push("coachMessage must be immutable");
  }
  if (brief.confidence && !isFrozen(brief.confidence)) {
    errors.push("confidence must be immutable");
  }
  if (!isFrozen(brief)) {
    errors.push("Brief must be immutable (Object.freeze)");
  }

  if (
    brief.confidence &&
    (brief.confidence.score < 0 || brief.confidence.score > 1)
  ) {
    errors.push("confidence.score must be between 0 and 1");
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function assertDailyBriefImmutable(brief: DailyBrief): void {
  if (!Object.isFrozen(brief)) {
    throw new Error("DailyBrief must be frozen");
  }
}
