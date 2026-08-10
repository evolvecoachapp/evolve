import { TimelineEventTypes } from "../../coach-timeline/models/TimelineEventType";
import type { ReminderDto, NotificationSettingsDto } from "../services";
import type { NotificationRuntimeSessionOverlay } from "../types/notificationRuntimeSession";
import { appendNotificationTimelineEntry } from "./appendNotificationTimelineEntry";

function withUniqueIds(ids: readonly string[], nextId: string): readonly string[] {
  return Object.freeze([...new Set([...ids, nextId])]);
}

export interface DismissRuntimeNotificationInput {
  readonly athleteId: string;
  readonly notificationId: string;
  readonly overlay: NotificationRuntimeSessionOverlay;
  readonly at: string;
}

export function dismissRuntimeNotification(
  input: DismissRuntimeNotificationInput,
): NotificationRuntimeSessionOverlay {
  appendNotificationTimelineEntry({
    athleteId: input.athleteId,
    eventType: TimelineEventTypes.NOTIFICATION_DISMISSED,
    summary: `Notification dismissed (${input.notificationId})`,
    explanation: `Athlete dismissed notification ${input.notificationId}`,
    at: input.at,
    metadata: Object.freeze({
      notificationId: input.notificationId,
    }),
  });

  return Object.freeze({
    ...input.overlay,
    dismissedNotificationIds: withUniqueIds(
      input.overlay.dismissedNotificationIds,
      input.notificationId,
    ),
  });
}

export interface MarkRuntimeNotificationReadInput {
  readonly notificationId: string;
  readonly overlay: NotificationRuntimeSessionOverlay;
}

export function markRuntimeNotificationRead(
  input: MarkRuntimeNotificationReadInput,
): NotificationRuntimeSessionOverlay {
  return Object.freeze({
    ...input.overlay,
    readNotificationIds: withUniqueIds(
      input.overlay.readNotificationIds,
      input.notificationId,
    ),
  });
}

export interface CreateRuntimeReminderInput {
  readonly athleteId: string;
  readonly reminder: ReminderDto;
  readonly overlay: NotificationRuntimeSessionOverlay;
  readonly at: string;
}

export function createRuntimeReminder(
  input: CreateRuntimeReminderInput,
): NotificationRuntimeSessionOverlay {
  appendNotificationTimelineEntry({
    athleteId: input.athleteId,
    eventType: TimelineEventTypes.REMINDER_CREATED,
    summary: input.reminder.title,
    explanation: input.reminder.message,
    at: input.at,
    metadata: Object.freeze({
      reminderId: input.reminder.id,
      reminderType: input.reminder.type,
      title: input.reminder.title,
      message: input.reminder.message,
      dayOfWeek: input.reminder.schedule.dayOfWeek.join(","),
      timeOfDay: input.reminder.schedule.timeOfDay,
      deliveryPolicy: input.reminder.deliveryPolicy,
      enabled: String(input.reminder.enabled),
      createdAt: input.reminder.createdAt,
      updatedAt: input.reminder.updatedAt,
    }),
  });

  const reminders = Object.freeze([
    ...input.overlay.reminders.filter((item) => item.id !== input.reminder.id),
    input.reminder,
  ]);

  return Object.freeze({
    ...input.overlay,
    reminders,
  });
}

export interface UpdateRuntimeReminderInput {
  readonly reminder: ReminderDto;
  readonly overlay: NotificationRuntimeSessionOverlay;
}

export function updateRuntimeReminder(
  input: UpdateRuntimeReminderInput,
): NotificationRuntimeSessionOverlay {
  const reminders = Object.freeze(
    input.overlay.reminders.map((item) =>
      item.id === input.reminder.id ? input.reminder : item,
    ),
  );

  return Object.freeze({
    ...input.overlay,
    reminders,
  });
}

export interface DeleteRuntimeReminderInput {
  readonly reminderId: string;
  readonly overlay: NotificationRuntimeSessionOverlay;
}

export function deleteRuntimeReminder(
  input: DeleteRuntimeReminderInput,
): NotificationRuntimeSessionOverlay {
  return Object.freeze({
    ...input.overlay,
    reminders: Object.freeze(
      input.overlay.reminders.filter((item) => item.id !== input.reminderId),
    ),
    deletedReminderIds: withUniqueIds(
      input.overlay.deletedReminderIds,
      input.reminderId,
    ),
  });
}

export interface UpdateRuntimeNotificationSettingsInput {
  readonly settings: NotificationSettingsDto;
  readonly overlay: NotificationRuntimeSessionOverlay;
}

export function updateRuntimeNotificationSettings(
  input: UpdateRuntimeNotificationSettingsInput,
): NotificationRuntimeSessionOverlay {
  return Object.freeze({
    ...input.overlay,
    settings: input.settings,
  });
}
