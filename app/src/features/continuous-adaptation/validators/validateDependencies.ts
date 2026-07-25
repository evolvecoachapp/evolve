import type { AdaptationDependency } from "../models/AdaptationDependency";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function validateDependencies(
  dependencies: readonly AdaptationDependency[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  for (const dep of dependencies) {
    if (!dep.fromId || !dep.toId) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.VALIDATION_FAILED,
          "Dependency requires fromId and toId",
          dep.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
