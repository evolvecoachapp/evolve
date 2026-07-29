import { mapAthleteProfile } from "../mappers";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type NutritionPreferencesDto,
} from "../services";

export interface UpdateNutritionPreferencesDeps {
  readonly service?: ProfileExperienceService;
  readonly prefs: NutritionPreferencesDto;
}

export async function updateNutritionPreferences(
  deps: UpdateNutritionPreferencesDeps,
): Promise<AthleteProfile> {
  const service = deps.service ?? profileExperienceService;
  const dto = await service.updateNutritionPreferences(deps.prefs);
  return mapAthleteProfile(dto);
}
