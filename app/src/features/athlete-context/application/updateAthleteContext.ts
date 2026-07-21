import type { AthleteProfile } from "../models/AthleteProfile";
import {
  athleteContextRepository,
  type AthleteContextRepository,
} from "../repository";

export interface UpdateAthleteContextOptions {
  readonly repository?: AthleteContextRepository;
  readonly profile: AthleteProfile;
}

/**
 * Persists an athlete profile update via the repository layer.
 */
export async function updateAthleteContext({
  repository = athleteContextRepository,
  profile,
}: UpdateAthleteContextOptions): Promise<AthleteProfile> {
  return repository.updateProfile(profile);
}
