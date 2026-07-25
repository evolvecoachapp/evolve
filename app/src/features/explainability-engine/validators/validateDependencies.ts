import type { ExplanationDependency } from "../models/ExplanationDependency";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

export function validateDependencies(
  dependencies: readonly ExplanationDependency[],
): readonly ExplanationError[] {
  const errors: ExplanationError[] = [];
  for (const d of dependencies) {
    if (!d.fromId || !d.toId) errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Dependency requires fromId and toId", d.id));
  }
  return Object.freeze(errors);
}
