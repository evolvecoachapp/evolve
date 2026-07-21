import type { AthleteProfile } from "../models/AthleteProfile";
import type { AthleteContextValidationResult } from "../models/AthleteContextValidationResult";
import { validateAthleteContext as validateAthleteContextPure } from "../validation/validateAthleteContext";

/**
 * Application-layer validation entry point.
 *
 * Delegates to the pure validator; never throws for validation failures.
 */
export function validateAthleteContext(
  profile: AthleteProfile,
): AthleteContextValidationResult {
  return validateAthleteContextPure(profile);
}
