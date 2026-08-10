import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { mapAthleteIdentityToProfile } from "../mappers/mapAthleteIdentityToProfile";
import type { AthleteProfile } from "../models";

/**
 * Reads the hydrated athlete identity from the Composition Root and projects
 * it into the Profile Experience read model.
 */
export function readHydratedProfile(athleteId: string): AthleteProfile | null {
  const root = getCompositionRoot();
  const identity = root.resolve("AthleteIdentityService").getAthleteIdentity(athleteId);
  if (!identity) {
    return null;
  }

  const runtimeEnvironment =
    root.resolve("RuntimeEnvironmentService").getRuntimeEnvironment();

  return mapAthleteIdentityToProfile({
    identity,
    runtimeEnvironment,
  });
}
