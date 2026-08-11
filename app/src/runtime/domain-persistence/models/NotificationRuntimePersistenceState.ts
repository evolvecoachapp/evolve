import type {
  NotificationSettingsDto,
  ReminderDto,
} from "../../../features/notification-center/services/NotificationCenterService";

/**
 * Persisted notification runtime overlay stored in Unified Workspace (Sprint 35.5).
 */
export interface NotificationRuntimePersistenceState {
  readonly athleteId: string;
  readonly readNotificationIds: readonly string[];
  readonly dismissedNotificationIds: readonly string[];
  readonly reminders: readonly ReminderDto[];
  readonly deletedReminderIds: readonly string[];
  readonly settings: NotificationSettingsDto | null;
}

export function createNotificationRuntimePersistenceState(
  input: NotificationRuntimePersistenceState,
): NotificationRuntimePersistenceState {
  return Object.freeze({
    athleteId: input.athleteId,
    readNotificationIds: Object.freeze([...input.readNotificationIds]),
    dismissedNotificationIds: Object.freeze([...input.dismissedNotificationIds]),
    reminders: Object.freeze([...input.reminders]),
    deletedReminderIds: Object.freeze([...input.deletedReminderIds]),
    settings: input.settings,
  });
}
