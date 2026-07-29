import { mapAthleteProfile } from "../mappers";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type NotificationPreferencesDto,
} from "../services";

export interface UpdateNotificationPreferencesDeps {
  readonly service?: ProfileExperienceService;
  readonly prefs: NotificationPreferencesDto;
}

export async function updateNotificationPreferences(
  deps: UpdateNotificationPreferencesDeps,
): Promise<AthleteProfile> {
  const service = deps.service ?? profileExperienceService;
  const dto = await service.updateNotificationPreferences(deps.prefs);
  return mapAthleteProfile(dto);
}
