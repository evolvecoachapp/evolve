import { mapAthleteProfile } from "../mappers";
import type { AthleteProfile } from "../models";
import {
  ProfileExperienceError,
  profileExperienceService,
  type ProfileExperienceService,
  type NotificationPreferencesDto,
} from "../services";

export interface UpdateNotificationPreferencesDeps {
  readonly service?: ProfileExperienceService;
  readonly athleteId?: string;
  readonly prefs: NotificationPreferencesDto;
}

/**
 * Notification preferences are not part of Athlete Identity — they belong to
 * the Notification Center's own settings (see notification-center models).
 * The runtime path has no identity field to persist this into, so it fails
 * explicitly rather than silently reporting success without saving anything.
 */
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

  throw new ProfileExperienceError(
    "Notification preferences aren't editable from Profile yet — manage reminders and alerts from the Notifications tab.",
  );
}
