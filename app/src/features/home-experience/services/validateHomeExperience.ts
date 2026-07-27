import type { HomeExperience } from "../models/HomeExperience";
import type { HomeExperienceValidation } from "../models/HomeExperienceResult";

function isFrozen(value: unknown): boolean {
  return typeof value === "object" && value !== null && Object.isFrozen(value);
}

/**
 * Validate a Home Experience is complete, consistent, and immutable.
 */
export function validateHomeExperience(
  experience: HomeExperience | null | undefined,
): HomeExperienceValidation {
  const errors: string[] = [];

  if (!experience) {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["Home experience is missing"]),
    });
  }

  if (!experience.id) errors.push("Experience id is required");
  if (!experience.athleteId) errors.push("Experience athleteId is required");
  if (!experience.timestamp) errors.push("Experience timestamp is required");
  if (!experience.summary) errors.push("Experience summary is required");
  if (!experience.workout) errors.push("Experience workout card is required");
  if (!experience.nutrition) {
    errors.push("Experience nutrition card is required");
  }
  if (!experience.recovery) errors.push("Experience recovery card is required");
  if (!experience.goal) errors.push("Experience goal card is required");
  if (!experience.insights) errors.push("Experience insights are required");
  if (!experience.timeline) errors.push("Experience timeline card is required");
  if (!experience.coach) errors.push("Experience coach card is required");
  if (!experience.quickActions) {
    errors.push("Experience quickActions are required");
  }
  if (!experience.relatedDomains) {
    errors.push("Experience relatedDomains are required");
  }
  if (!experience.metadata) errors.push("Experience metadata is required");

  if (experience.summary) {
    if (experience.summary.athleteId !== experience.athleteId) {
      errors.push("Summary athleteId must match experience athleteId");
    }
    if (experience.summary.insightCount !== experience.insights.length) {
      errors.push("Summary insightCount must match insights length");
    }
    if (!isFrozen(experience.summary)) {
      errors.push("summary must be immutable");
    }
  }

  if (experience.workout && !isFrozen(experience.workout)) {
    errors.push("workout card must be immutable");
  }
  if (experience.nutrition && !isFrozen(experience.nutrition)) {
    errors.push("nutrition card must be immutable");
  }
  if (experience.recovery && !isFrozen(experience.recovery)) {
    errors.push("recovery card must be immutable");
  }
  if (experience.goal && !isFrozen(experience.goal)) {
    errors.push("goal card must be immutable");
  }
  if (experience.timeline && !isFrozen(experience.timeline)) {
    errors.push("timeline card must be immutable");
  }
  if (experience.coach && !isFrozen(experience.coach)) {
    errors.push("coach card must be immutable");
  }
  if (experience.insights && !isFrozen(experience.insights)) {
    errors.push("insights must be immutable");
  }
  if (experience.quickActions && !isFrozen(experience.quickActions)) {
    errors.push("quickActions must be immutable");
  }
  if (!isFrozen(experience)) {
    errors.push("Experience must be immutable (Object.freeze)");
  }

  for (const action of experience.quickActions ?? []) {
    if (!action.id || !action.kind || !action.label) {
      errors.push("Quick action missing required fields");
      break;
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function assertHomeExperienceImmutable(
  experience: HomeExperience,
): void {
  if (!Object.isFrozen(experience)) {
    throw new Error("HomeExperience must be frozen");
  }
}
