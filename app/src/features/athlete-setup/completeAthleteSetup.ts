import { updateCurrentUser } from "../../api/users";
import type { UserPublic } from "../../types/api";
import { mapSetupToUserUpdate } from "./mapSetupToUserUpdate";
import type { AthleteSetupValues } from "./models";
import { validateAthleteSetup } from "./validation";

export class AthleteSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AthleteSetupError";
  }
}

/**
 * Persists the Sprint 1 athlete setup onto the existing User row.
 * Does not create Goal rows. Does not touch Athlete Identity.
 */
export async function completeAthleteSetup(
  values: AthleteSetupValues,
): Promise<UserPublic> {
  const validation = validateAthleteSetup(values);
  if (!validation.isValid) {
    throw new AthleteSetupError("Please fix the highlighted fields.");
  }

  return updateCurrentUser(mapSetupToUserUpdate(values));
}
