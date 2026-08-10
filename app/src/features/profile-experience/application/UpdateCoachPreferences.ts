import { mapAthleteProfile } from "../mappers";
import { mapCoachPreferencesDtoToIdentityUpdate } from "../mappers/mapProfileUpdateToIdentity";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type CoachPreferencesDto,
} from "../services";
import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import {
  createProfileIdentityRequestId,
  updateAthleteIdentityFromProfile,
} from "./updateAthleteIdentityFromProfile";

export interface UpdateCoachPreferencesDeps {
  readonly service?: ProfileExperienceService;
  readonly athleteId?: string;
  readonly prefs: CoachPreferencesDto;
}

export async function updateCoachPreferences(
  deps: UpdateCoachPreferencesDeps,
): Promise<AthleteProfile> {
  if (deps.service) {
    const dto = await deps.service.updateCoachPreferences(deps.prefs);
    return mapAthleteProfile(dto);
  }

  if (!deps.athleteId) {
    throw new Error("athleteId is required for runtime profile updates");
  }

  const identity = getCompositionRoot()
    .resolve("AthleteIdentityService")
    .getAthleteIdentity(deps.athleteId);

  if (!identity) {
    throw new Error("Athlete identity unavailable");
  }

  return updateAthleteIdentityFromProfile({
    athleteId: deps.athleteId,
    requestId: createProfileIdentityRequestId(deps.athleteId, "coach"),
    update: {
      preferences: mapCoachPreferencesDtoToIdentityUpdate(
        deps.prefs,
        identity.preferences,
      ),
    },
  });
}
