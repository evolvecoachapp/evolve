import { mapAthleteProfile } from "../mappers";
import type { AthleteProfile } from "../models";
import {
  profileExperienceService,
  type ProfileExperienceService,
  type NotificationPreferencesDto,
} from "../services";
import { readRuntimeProfile } from "./updateAthleteIdentityFromProfile";

export interface UpdateNotificationPreferencesDeps {
  readonly service?: ProfileExperienceService;
  readonly athleteId?: string;
  readonly prefs: NotificationPreferencesDto;
}

export async function updateNotificationPreferences(
  deps: UpdateNotificationPreferencesDeps,
): Promise<AthleteProfile> {
  if (deps.service) {
    const dto = await deps.service.updateNotificationPreferences(deps.prefs);
    return mapAthleteProfile(dto);
  }

  if (!deps.athleteId) {
    throw new Error("athleteId is required for runtime profile updates");
  }

  return readRuntimeProfile(deps.athleteId);
}
