import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { mapNotificationCenterData } from "../mappers";
import type { NotificationCenterData } from "../mappers";
import { mapWorkspaceNotificationsToExperienceDto } from "../mappers/mapWorkspaceNotificationsToExperienceDto";
import type { NotificationRuntimeSessionOverlay } from "../types/notificationRuntimeSession";
import { EMPTY_NOTIFICATION_RUNTIME_SESSION } from "../types/notificationRuntimeSession";

export interface LoadHydratedNotificationExperienceOptions {
  readonly athleteId: string;
  readonly overlay?: NotificationRuntimeSessionOverlay;
}

/**
 * Loads Notification Center data from hydrated Unified Workspace and Coach Timeline.
 */
export async function loadHydratedNotificationExperience({
  athleteId,
  overlay = EMPTY_NOTIFICATION_RUNTIME_SESSION,
}: LoadHydratedNotificationExperienceOptions): Promise<NotificationCenterData | null> {
  const root = getCompositionRoot();
  const workspace = root.resolve("UnifiedWorkspaceService").getWorkspace(athleteId);
  if (!workspace) {
    return null;
  }

  const timeline = root.resolve("CoachTimelineService").getTimeline(athleteId);
  const dto = mapWorkspaceNotificationsToExperienceDto({
    workspace,
    timeline,
    overlay,
  });

  return mapNotificationCenterData(dto);
}
