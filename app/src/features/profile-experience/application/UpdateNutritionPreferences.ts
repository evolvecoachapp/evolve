import { mapAthleteProfile } from "../mappers";
import { mapNutritionPreferencesDtoToIdentityUpdate } from "../mappers/mapProfileUpdateToIdentity";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type NutritionPreferencesDto,
} from "../services";
import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import {
  createProfileIdentityRequestId,
  updateAthleteIdentityFromProfile,
} from "./updateAthleteIdentityFromProfile";

export interface UpdateNutritionPreferencesDeps {
  readonly service?: ProfileExperienceService;
  readonly athleteId?: string;
  readonly prefs: NutritionPreferencesDto;
}

export async function updateNutritionPreferences(
  deps: UpdateNutritionPreferencesDeps,
): Promise<AthleteProfile> {
  if (deps.service) {
    const dto = await deps.service.updateNutritionPreferences(deps.prefs);
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
    requestId: createProfileIdentityRequestId(deps.athleteId, "nutrition"),
    update: {
      preferences: mapNutritionPreferencesDtoToIdentityUpdate(
        deps.prefs,
        identity.preferences,
      ),
    },
  });
}
