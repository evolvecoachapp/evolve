import type { AthleteState } from "../models/AthleteState";
import type { StateValidation } from "../models/StateValidation";
import { validateStateIntegrity } from "../validators/validateStateIntegrity";

export function applyIntegrityPolicy(state: AthleteState): StateValidation {
  return validateStateIntegrity(state);
}
