import type { NotificationSettingsDto, ReminderDto } from "../services";

/**
 * In-session notification overlay merged during hydration.
 * Mirrors Coach Experience session message overlay — not a persistence domain.
 */
export interface NotificationRuntimeSessionOverlay {
  readonly readNotificationIds: readonly string[];
  readonly dismissedNotificationIds: readonly string[];
  readonly reminders: readonly ReminderDto[];
  readonly deletedReminderIds: readonly string[];
  readonly settings: NotificationSettingsDto | null;
}

export const EMPTY_NOTIFICATION_RUNTIME_SESSION: NotificationRuntimeSessionOverlay =
  Object.freeze({
    readNotificationIds: Object.freeze([]),
    dismissedNotificationIds: Object.freeze([]),
    reminders: Object.freeze([]),
    deletedReminderIds: Object.freeze([]),
    settings: null,
  });
