import { mapAthleteProfile } from "../mappers";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type AppearancePreferencesDto,
} from "../services";

export interface UpdateAppearancePreferencesDeps {
  readonly service?: ProfileExperienceService;
  readonly prefs: AppearancePreferencesDto;
}

export async function updateAppearancePreferences(
  deps: UpdateAppearancePreferencesDeps,
): Promise<AthleteProfile> {
  const service = deps.service ?? profileExperienceService;
  const dto = await service.updateAppearancePreferences(deps.prefs);
  return mapAthleteProfile(dto);
}
