import { mapAthleteProfile } from "../mappers";
import { mapAppearanceDtoToBuildSettings } from "../mappers/mapProfileUpdateToIdentity";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type AppearancePreferencesDto,
} from "../services";
import {
  createProfileIdentityRequestId,
  updateAthleteIdentityFromProfile,
} from "./updateAthleteIdentityFromProfile";

export interface UpdateAppearancePreferencesDeps {
  readonly service?: ProfileExperienceService;
  readonly athleteId?: string;
  readonly prefs: AppearancePreferencesDto;
}

export async function updateAppearancePreferences(
  deps: UpdateAppearancePreferencesDeps,
): Promise<AthleteProfile> {
  if (deps.service) {
    const dto = await deps.service.updateAppearancePreferences(deps.prefs);
    return mapAthleteProfile(dto);
  }

  if (!deps.athleteId) {
    throw new Error("athleteId is required for runtime profile updates");
  }

  return updateAthleteIdentityFromProfile({
    athleteId: deps.athleteId,
    requestId: createProfileIdentityRequestId(deps.athleteId, "appearance"),
    update: {
      settings: mapAppearanceDtoToBuildSettings(deps.prefs),
    },
  });
}
