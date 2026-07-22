import type { CandidateExercise } from "../models/CandidateExercise";
import type { ExerciseSelectionRequest } from "../models/ExerciseSelectionRequest";
import type { SelectionContext } from "../models/SelectionContext";
import { validateBlueprintCompatibility } from "./validateBlueprintCompatibility";
import { validateCandidateConsistency } from "./validateCandidateConsistency";
import { validateConstraintViolations } from "./validateConstraintViolations";
import { validateDuplicates } from "./validateDuplicates";
import { validateRelationships } from "./validateRelationships";

/**
 * Run the full selection validation suite and return unique issue codes.
 */
export function validateSelectionResult(
  request: ExerciseSelectionRequest,
  context: SelectionContext,
  candidates: readonly CandidateExercise[],
): readonly string[] {
  const issues = [
    ...validateBlueprintCompatibility(request),
    ...validateCandidateConsistency(candidates, context),
    ...validateRelationships(candidates),
    ...validateDuplicates(candidates),
    ...validateConstraintViolations(candidates, context),
  ];
  return Object.freeze([...new Set(issues)]);
}

export { validateBlueprintCompatibility } from "./validateBlueprintCompatibility";
export { validateCandidateConsistency } from "./validateCandidateConsistency";
export { validateRelationships } from "./validateRelationships";
export { validateDuplicates } from "./validateDuplicates";
export { validateConstraintViolations } from "./validateConstraintViolations";
