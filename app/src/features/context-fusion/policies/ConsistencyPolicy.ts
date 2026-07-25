import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import type { ContextValidation } from "../models/ContextValidation";
import { validateDependencies } from "../validators/validateDependencies";
import { validateTimelineIntegrity } from "../validators/validateTimelineIntegrity";

export function applyConsistencyPolicy(
  context: UnifiedCoachingContext,
): ContextValidation {
  const deps = validateDependencies(context);
  const timeline = validateTimelineIntegrity(context);
  const issues = Object.freeze([...deps.issues, ...timeline.issues]);
  return Object.freeze({
    valid: issues.length === 0,
    issues,
  });
}
