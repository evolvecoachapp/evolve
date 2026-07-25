import type { DecisionDependency } from "../models/DecisionDependency";
import type { DecisionCandidate } from "../models/DecisionCandidate";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";

export function validateDependencies(input: {
  readonly candidates: readonly DecisionCandidate[];
  readonly dependencies: readonly DecisionDependency[];
}): readonly DecisionError[] {
  const ids = new Set(input.candidates.map((c) => c.id));
  const errors: DecisionError[] = [];
  for (const dep of input.dependencies) {
    if (!ids.has(dep.fromId) || !ids.has(dep.toId)) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Dependency references unknown candidate",
          [dep.id],
        ),
      );
    }
  }
  return Object.freeze(errors);
}
