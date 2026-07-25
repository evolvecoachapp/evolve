import type { DecisionConflict } from "../models/DecisionConflict";
import type { DecisionResolution } from "../models/DecisionResolution";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";

export function validateConflicts(input: {
  readonly conflicts: readonly DecisionConflict[];
  readonly resolutions: readonly DecisionResolution[];
}): readonly DecisionError[] {
  const resolved = new Set(input.resolutions.map((r) => r.conflictId));
  const errors: DecisionError[] = [];
  for (const c of input.conflicts) {
    if (c.resolved && !resolved.has(c.id)) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Conflict marked resolved without resolution record",
          [c.id],
        ),
      );
    }
  }
  return Object.freeze(errors);
}
