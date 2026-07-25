import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { validateConflictResolution } from "./validateConflictResolution";
import { validateContextIntegrity } from "./validateContextIntegrity";
import { validateDependencies } from "./validateDependencies";
import { validateMergeConsistency } from "./validateMergeConsistency";
import { validateTimelineIntegrity } from "./validateTimelineIntegrity";
import { validateVersionConsistency } from "./validateVersionConsistency";

export function validateUnifiedContextFull(
  context: UnifiedCoachingContext,
): ContextValidation {
  const parts = [
    validateContextIntegrity(context),
    validateVersionConsistency(context),
    validateDependencies(context),
    validateMergeConsistency(context),
    validateConflictResolution(context),
    validateTimelineIntegrity(context),
  ];
  const issues = Object.freeze(parts.flatMap((p) => [...p.issues]));
  return Object.freeze({
    valid: issues.length === 0,
    issues,
  });
}
