import { mapAthleteProfile } from "../mappers";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type TrainingPreferencesDto,
} from "../services";

export interface UpdateTrainingPreferencesDeps {
  readonly service?: ProfileExperienceService;
  readonly prefs: TrainingPreferencesDto;
}

export async function updateTrainingPreferences(
  deps: UpdateTrainingPreferencesDeps,
): Promise<AthleteProfile> {
  const service = deps.service ?? profileExperienceService;
  const dto = await service.updateTrainingPreferences(deps.prefs);
  return mapAthleteProfile(dto);
}
