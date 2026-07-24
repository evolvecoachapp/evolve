import type { AthleteState } from "../models/AthleteState";
import type { StateValidation } from "../models/StateValidation";
import { validateVersionConsistency } from "../validators/validateVersionConsistency";

export function applyVersionPolicy(state: AthleteState): StateValidation {
  return validateVersionConsistency(state);
}
