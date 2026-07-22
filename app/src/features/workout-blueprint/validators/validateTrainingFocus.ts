import type { TrainingFocus } from "../models/TrainingFocus";
import { TRAINING_FOCUS_AREAS } from "../models/TrainingFocus";

export type TrainingFocusValidationCode =
  | "missing_primary_focus"
  | "invalid_primary_focus"
  | "invalid_secondary_focus";

/**
 * Validate a TrainingFocus structural contract.
 */
export function validateTrainingFocus(
  focus: unknown,
): readonly TrainingFocusValidationCode[] {
  const issues: TrainingFocusValidationCode[] = [];

  if (focus === null || typeof focus !== "object") {
    return Object.freeze(["missing_primary_focus"]);
  }

  const candidate = focus as Partial<TrainingFocus>;

  if (
    typeof candidate.primary !== "string" ||
    candidate.primary.trim().length === 0
  ) {
    issues.push("missing_primary_focus");
  } else if (
    !(TRAINING_FOCUS_AREAS as readonly string[]).includes(candidate.primary)
  ) {
    issues.push("invalid_primary_focus");
  }

  if (
    candidate.secondary !== null &&
    candidate.secondary !== undefined &&
    (typeof candidate.secondary !== "string" ||
      !(TRAINING_FOCUS_AREAS as readonly string[]).includes(candidate.secondary))
  ) {
    issues.push("invalid_secondary_focus");
  }

  return Object.freeze([...new Set(issues)]);
}
