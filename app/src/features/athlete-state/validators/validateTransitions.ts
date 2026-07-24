import type { AthleteState } from "../models/AthleteState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateTransitions(input: {
  readonly current: AthleteState | null;
  readonly contributions: readonly SpecialistContribution[];
}): StateValidation {
  const issues = [];
  for (const c of input.contributions) {
    if (input.current && c.athleteId !== input.current.athleteId) {
      issues.push({
        code: StateValidationCodes.INVALID_TRANSITION,
        message: "Contribution athleteId mismatch.",
        path: `contributions[${c.id}].athleteId`,
      });
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
