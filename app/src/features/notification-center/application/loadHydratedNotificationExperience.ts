import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { readPersistedNotificationSessionOverlay } from "../../../runtime/domain-persistence/application/persistNotificationRuntimeMutation";
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
  overlay,
}: LoadHydratedNotificationExperienceOptions): Promise<NotificationCenterData | null> {
  const root = getCompositionRoot();
  const workspace = root.resolve("UnifiedWorkspaceService").getWorkspace(athleteId);
  if (!workspace) {
    return null;
  }

  const timeline = root.resolve("CoachTimelineService").getTimeline(athleteId);
  const resolvedOverlay =
    overlay ??
    readPersistedNotificationSessionOverlay(athleteId) ??
    EMPTY_NOTIFICATION_RUNTIME_SESSION;
  const dto = mapWorkspaceNotificationsToExperienceDto({
    workspace,
    timeline,
    overlay: resolvedOverlay,
  });

  return mapNotificationCenterData(dto);
}
