import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import { CoachInsightSeverities } from "../../proactive-insights/models/CoachInsightSeverity";
import type { Workspace } from "../../unified-workspace/models/Workspace";
import type { NotificationPriority } from "../models/NotificationPriority";
import { NotificationCategories } from "../models/NotificationCategory";
import { NotificationStates } from "../models/NotificationState";
import type {
  CoachNotificationDto,
  NotificationCenterDataDto,
  NotificationItemDto,
  NotificationSettingsDto,
  NotificationStatisticsDto,
  ReminderDto,
} from "../services";
import { DEFAULT_NOTIFICATION_SETTINGS } from "../application/defaultNotificationSettings";
import type { NotificationRuntimeSessionOverlay } from "../types/notificationRuntimeSession";

const TIMELINE_EVENT_REMINDER_CREATED = "reminder_created";
const TIMELINE_EVENT_NOTIFICATION_DISMISSED = "notification_dismissed";

function mapSeverityToPriority(severity: string): NotificationPriority {
  const normalized = severity.trim().toUpperCase();
  if (normalized === CoachInsightSeverities.CRITICAL) {
    return "urgent";
  }
  if (normalized === CoachInsightSeverities.HIGH) {
    return "high";
  }
  if (normalized === CoachInsightSeverities.LOW) {
    return "low";
  }
  return "normal";
}

function resolveNotificationState(
  notificationId: string,
  overlay: NotificationRuntimeSessionOverlay,
  baseState: NotificationCenterDataDto["notifications"][number]["state"],
): NotificationCenterDataDto["notifications"][number]["state"] {
  if (overlay.dismissedNotificationIds.includes(notificationId)) {
    return NotificationStates.DISMISSED;
  }
  if (overlay.readNotificationIds.includes(notificationId)) {
    return NotificationStates.DELIVERED;
  }
  return baseState;
}

function resolveReadAt(
  notificationId: string,
  overlay: NotificationRuntimeSessionOverlay,
): string | null {
  return overlay.readNotificationIds.includes(notificationId)
    ? new Date().toISOString()
    : null;
}

function mapInsightToCoachNotification(
  insight: CoachInsight,
  overlay: NotificationRuntimeSessionOverlay,
): CoachNotificationDto | null {
  if (overlay.dismissedNotificationIds.includes(insight.id)) {
    return null;
  }

  const state = resolveNotificationState(
    insight.id,
    overlay,
    NotificationStates.PENDING,
  );

  return Object.freeze({
    id: insight.id,
    title: insight.title,
    message: insight.summary,
    category: NotificationCategories.COACH,
    priority: mapSeverityToPriority(insight.severity),
    state,
    coachContext: insight.reason.reason,
    actionDestination: "/(app)/(tabs)/coach",
    createdAt: insight.timestamp,
    readAt: resolveReadAt(insight.id, overlay),
  });
}

function buildWorkoutReminder(
  workspace: Workspace,
  overlay: NotificationRuntimeSessionOverlay,
): NotificationItemDto | null {
  if (!workspace.workout.present || !workspace.workout.card) {
    return null;
  }

  const id = `notif:workout:${workspace.workout.planId ?? workspace.athleteId}`;
  if (overlay.dismissedNotificationIds.includes(id)) {
    return null;
  }

  return Object.freeze({
    id,
    title: workspace.workout.card.planName || "Workout Reminder",
    message: workspace.workout.summary || workspace.workout.card.summary,
    category: NotificationCategories.REMINDER,
    priority: "normal",
    state: resolveNotificationState(id, overlay, NotificationStates.DELIVERED),
    icon: "barbell-outline",
    createdAt: workspace.metadata.generatedAt,
    readAt: resolveReadAt(id, overlay),
    expiresAt: null,
    actions: Object.freeze([]),
    destination: "/(app)/(tabs)/workout",
  });
}

function buildRecoveryReminder(
  workspace: Workspace,
  overlay: NotificationRuntimeSessionOverlay,
): NotificationItemDto | null {
  if (!workspace.recovery.present) {
    return null;
  }

  const fatigueScore = workspace.recovery.fatigueScore;
  if (fatigueScore === null || fatigueScore < 60) {
    return null;
  }

  const id = `notif:recovery:${workspace.athleteId}:${workspace.metadata.generatedAt.slice(0, 10)}`;
  if (overlay.dismissedNotificationIds.includes(id)) {
    return null;
  }

  return Object.freeze({
    id,
    title: "Recovery Check",
    message: workspace.recovery.summary || `Fatigue score is ${fatigueScore}.`,
    category: NotificationCategories.REMINDER,
    priority: fatigueScore >= 80 ? "high" : "normal",
    state: resolveNotificationState(id, overlay, NotificationStates.DELIVERED),
    icon: "bed-outline",
    createdAt: workspace.metadata.generatedAt,
    readAt: resolveReadAt(id, overlay),
    expiresAt: null,
    actions: Object.freeze([]),
    destination: "/(app)/recovery",
  });
}

function buildProgressNotifications(
  workspace: Workspace,
  overlay: NotificationRuntimeSessionOverlay,
): readonly NotificationItemDto[] {
  const items: NotificationItemDto[] = [];

  for (const card of workspace.insights.homeInsightCards) {
    const id = `notif:progress:${card.id}`;
    if (overlay.dismissedNotificationIds.includes(id)) {
      continue;
    }

    items.push(
      Object.freeze({
        id,
        title: card.title,
        message: card.summary,
        category: NotificationCategories.PROGRESS,
        priority: mapSeverityToPriority(card.severity),
        state: resolveNotificationState(id, overlay, NotificationStates.DELIVERED),
        icon: "trending-up-outline",
        createdAt: workspace.metadata.generatedAt,
        readAt: resolveReadAt(id, overlay),
        expiresAt: null,
        actions: Object.freeze([]),
        destination: "/(app)/(tabs)/progress",
      }),
    );
  }

  return Object.freeze(items);
}

function parseReminderFromTimelineMetadata(
  entryId: string,
  metadata: Readonly<Record<string, string>>,
  createdAt: string,
): ReminderDto | null {
  if (metadata.eventType !== TIMELINE_EVENT_REMINDER_CREATED) {
    return null;
  }

  const reminderId = metadata.reminderId ?? entryId;
  const dayOfWeek = metadata.dayOfWeek
    ? metadata.dayOfWeek.split(",").map((value) => Number.parseInt(value, 10))
    : [];

  return Object.freeze({
    id: reminderId,
    type: (metadata.reminderType as ReminderDto["type"]) ?? "custom",
    title: metadata.title ?? "Reminder",
    message: metadata.message ?? "",
    schedule: Object.freeze({
      dayOfWeek: Object.freeze(dayOfWeek.filter((day) => !Number.isNaN(day))),
      timeOfDay: metadata.timeOfDay ?? "09:00",
      deliveryPolicy:
        (metadata.deliveryPolicy as ReminderDto["schedule"]["deliveryPolicy"]) ??
        "daily",
      enabled: metadata.enabled !== "false",
    }),
    deliveryPolicy:
      (metadata.deliveryPolicy as ReminderDto["deliveryPolicy"]) ?? "daily",
    enabled: metadata.enabled !== "false",
    createdAt: metadata.createdAt ?? createdAt,
    updatedAt: metadata.updatedAt ?? createdAt,
  });
}

function remindersFromTimeline(timeline: CoachTimeline | null): readonly ReminderDto[] {
  if (!timeline) {
    return Object.freeze([]);
  }

  const byId = new Map<string, ReminderDto>();
  for (const entry of timeline.entries) {
    const reminder = parseReminderFromTimelineMetadata(
      entry.id,
      entry.metadata,
      entry.timestamp,
    );
    if (reminder) {
      byId.set(reminder.id, reminder);
    }
  }

  return Object.freeze([...byId.values()]);
}

function dismissedIdsFromTimeline(timeline: CoachTimeline | null): readonly string[] {
  if (!timeline) {
    return Object.freeze([]);
  }

  const ids: string[] = [];
  for (const entry of timeline.entries) {
    if (entry.metadata.eventType !== TIMELINE_EVENT_NOTIFICATION_DISMISSED) {
      continue;
    }
    const notificationId = entry.metadata.notificationId;
    if (notificationId) {
      ids.push(notificationId);
    }
  }
  return Object.freeze(ids);
}

function mergeReminders(
  timelineReminders: readonly ReminderDto[],
  sessionReminders: readonly ReminderDto[],
  deletedReminderIds: readonly string[],
): readonly ReminderDto[] {
  const deleted = new Set(deletedReminderIds);
  const byId = new Map<string, ReminderDto>();
  for (const reminder of timelineReminders) {
    if (!deleted.has(reminder.id)) {
      byId.set(reminder.id, reminder);
    }
  }
  for (const reminder of sessionReminders) {
    if (!deleted.has(reminder.id)) {
      byId.set(reminder.id, reminder);
    }
  }
  return Object.freeze([...byId.values()]);
}

function computeStatistics(
  notifications: readonly NotificationItemDto[],
  coachNotifications: readonly CoachNotificationDto[],
  reminders: readonly ReminderDto[],
): NotificationStatisticsDto {
  const allStates = [
    ...notifications.map((item) => item.state),
    ...coachNotifications.map((item) => item.state),
  ];

  const unreadCount =
    notifications.filter((item) => item.readAt === null && item.state !== NotificationStates.DISMISSED)
      .length +
    coachNotifications.filter(
      (item) => item.readAt === null && item.state !== NotificationStates.DISMISSED,
    ).length;

  return Object.freeze({
    totalNotifications: notifications.length + coachNotifications.length,
    unreadCount,
    dismissedCount: allStates.filter((state) => state === NotificationStates.DISMISSED).length,
    activeReminders: reminders.filter((reminder) => reminder.enabled).length,
    deliveredToday: allStates.filter((state) => state === NotificationStates.DELIVERED).length,
    pendingCount: allStates.filter((state) => state === NotificationStates.PENDING).length,
  });
}

export interface MapWorkspaceNotificationsInput {
  readonly workspace: Workspace;
  readonly timeline: CoachTimeline | null;
  readonly overlay?: NotificationRuntimeSessionOverlay;
}

/**
 * Projects hydrated Unified Workspace + Coach Timeline into Notification Center DTOs.
 */
export function mapWorkspaceNotificationsToExperienceDto({
  workspace,
  timeline,
  overlay,
}: MapWorkspaceNotificationsInput): NotificationCenterDataDto {
  const sessionOverlay = overlay ?? {
    readNotificationIds: Object.freeze([]),
    dismissedNotificationIds: Object.freeze([]),
    reminders: Object.freeze([]),
    deletedReminderIds: Object.freeze([]),
    settings: null,
  };

  const persistedDismissed = dismissedIdsFromTimeline(timeline);
  const mergedOverlay: NotificationRuntimeSessionOverlay = Object.freeze({
    readNotificationIds: sessionOverlay.readNotificationIds,
    dismissedNotificationIds: Object.freeze([
      ...new Set([
        ...sessionOverlay.dismissedNotificationIds,
        ...persistedDismissed,
      ]),
    ]),
    reminders: sessionOverlay.reminders,
    deletedReminderIds: sessionOverlay.deletedReminderIds,
    settings: sessionOverlay.settings,
  });

  const coachNotifications = Object.freeze(
    workspace.insights.insights
      .map((insight) => mapInsightToCoachNotification(insight, mergedOverlay))
      .filter((item): item is CoachNotificationDto => item !== null),
  );

  const notifications: NotificationItemDto[] = [
    ...buildProgressNotifications(workspace, mergedOverlay),
  ];

  const workoutReminder = buildWorkoutReminder(workspace, mergedOverlay);
  if (workoutReminder) {
    notifications.push(workoutReminder);
  }

  const recoveryReminder = buildRecoveryReminder(workspace, mergedOverlay);
  if (recoveryReminder) {
    notifications.push(recoveryReminder);
  }

  const reminders = mergeReminders(
    remindersFromTimeline(timeline),
    mergedOverlay.reminders,
    mergedOverlay.deletedReminderIds,
  );

  const settings: NotificationSettingsDto =
    mergedOverlay.settings ?? DEFAULT_NOTIFICATION_SETTINGS;

  const visibleNotifications = Object.freeze(
    notifications.filter((item) => item.state !== NotificationStates.DISMISSED),
  );

  return Object.freeze({
    notifications: visibleNotifications,
    reminders,
    coachNotifications,
    settings,
    statistics: computeStatistics(
      visibleNotifications,
      coachNotifications,
      reminders,
    ),
  });
}
