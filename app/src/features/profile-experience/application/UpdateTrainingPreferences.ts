import { mapAthleteProfile } from "../mappers";
import { mapTrainingPreferencesDtoToIdentityUpdate } from "../mappers/mapProfileUpdateToIdentity";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type TrainingPreferencesDto,
} from "../services";
import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import {
  createProfileIdentityRequestId,
  updateAthleteIdentityFromProfile,
} from "./updateAthleteIdentityFromProfile";

export interface UpdateTrainingPreferencesDeps {
  readonly service?: ProfileExperienceService;
  readonly athleteId?: string;
  readonly prefs: TrainingPreferencesDto;
}

export async function updateTrainingPreferences(
  deps: UpdateTrainingPreferencesDeps,
): Promise<AthleteProfile> {
  if (deps.service) {
    const dto = await deps.service.updateTrainingPreferences(deps.prefs);
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

  const mapped = mapTrainingPreferencesDtoToIdentityUpdate(
    deps.prefs,
    identity.profile,
    identity.preferences,
  );

  return updateAthleteIdentityFromProfile({
    athleteId: deps.athleteId,
    requestId: createProfileIdentityRequestId(deps.athleteId, "training"),
    update: mapped,
  });
}
