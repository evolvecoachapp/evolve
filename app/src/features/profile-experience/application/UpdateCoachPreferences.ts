import { mapAthleteProfile } from "../mappers";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type CoachPreferencesDto,
} from "../services";

export interface UpdateCoachPreferencesDeps {
  readonly service?: ProfileExperienceService;
  readonly prefs: CoachPreferencesDto;
}

export async function updateCoachPreferences(
  deps: UpdateCoachPreferencesDeps,
): Promise<AthleteProfile> {
  const service = deps.service ?? profileExperienceService;
  const dto = await service.updateCoachPreferences(deps.prefs);
  return mapAthleteProfile(dto);
}
