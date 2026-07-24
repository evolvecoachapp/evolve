import type { AthleteState } from "../models/AthleteState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import type { StateValidation } from "../models/StateValidation";
import { validateTransitions } from "../validators/validateTransitions";

export function applyTransitionPolicy(input: {
  readonly current: AthleteState | null;
  readonly contributions: readonly SpecialistContribution[];
}): StateValidation {
  return validateTransitions(input);
}
