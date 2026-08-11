import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { NotificationRuntimeSessionOverlay } from "../../../features/notification-center/types/notificationRuntimeSession";
import { createNotificationRuntimePersistenceState } from "../models/NotificationRuntimePersistenceState";

export interface PersistNotificationRuntimeMutationInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly overlay: NotificationRuntimeSessionOverlay;
}

/**
 * Rebuilds Unified Workspace with updated notification runtime overlay.
 * Successful builds are observed by Runtime Observer for write-through persistence.
 */
export function persistNotificationRuntimeMutation(
  input: PersistNotificationRuntimeMutationInput,
): void {
  const workspaceService = getCompositionRoot().resolve("UnifiedWorkspaceService");
  const current = workspaceService.getWorkspace(input.athleteId);
  if (!current) {
    return;
  }

  workspaceService.build({
    athleteId: input.athleteId,
    requestId: input.requestId,
    generatedAt: current.metadata.generatedAt,
    goalProgress: current.goals.goalProgress,
    goalRuntimeOverlay: current.goalRuntimeOverlay,
    coachRuntimeOverlay: current.coachRuntimeOverlay,
    notificationRuntimeOverlay: createNotificationRuntimePersistenceState({
      athleteId: input.athleteId,
      readNotificationIds: input.overlay.readNotificationIds,
      dismissedNotificationIds: input.overlay.dismissedNotificationIds,
      reminders: input.overlay.reminders,
      deletedReminderIds: input.overlay.deletedReminderIds,
      settings: input.overlay.settings,
    }),
    timeline: current.timeline.timeline,
    latestEvents: current.timeline.latestEvents,
    latestDecisions: current.timeline.latestDecisions,
    latestRestores: current.timeline.latestRestores,
    snapshot: current.snapshot.snapshot,
    coachingSession: current.coach.session,
    insights: current.insights.insights,
    criticalFindings: current.insights.criticalFindings,
  });
}

export function readPersistedNotificationRuntimeOverlay(athleteId: string) {
  return (
    getCompositionRoot()
      .resolve("UnifiedWorkspaceService")
      .getWorkspace(athleteId)?.notificationRuntimeOverlay ?? null
  );
}

export function readPersistedNotificationSessionOverlay(
  athleteId: string,
): NotificationRuntimeSessionOverlay | null {
  const overlay = readPersistedNotificationRuntimeOverlay(athleteId);
  if (!overlay) {
    return null;
  }

  return Object.freeze({
    readNotificationIds: overlay.readNotificationIds,
    dismissedNotificationIds: overlay.dismissedNotificationIds,
    reminders: overlay.reminders,
    deletedReminderIds: overlay.deletedReminderIds,
    settings: overlay.settings,
  });
}
