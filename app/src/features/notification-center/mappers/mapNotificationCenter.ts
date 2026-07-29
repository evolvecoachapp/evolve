import {
  createCoachNotification,
  createNotificationAction,
  createNotificationItem,
  createNotificationSettings,
  createNotificationStatistics,
  createReminder,
  createReminderSchedule,
  type CoachNotification,
  type NotificationItem,
  type NotificationSettings,
  type NotificationStatistics,
  type Reminder,
} from "../models";
import type {
  CoachNotificationDto,
  NotificationCenterDataDto,
  NotificationItemDto,
  NotificationStatisticsDto,
  NotificationSettingsDto,
  ReminderDto,
} from "../services";

export interface NotificationCenterData {
  readonly notifications: readonly NotificationItem[];
  readonly reminders: readonly Reminder[];
  readonly coachNotifications: readonly CoachNotification[];
  readonly settings: NotificationSettings;
  readonly statistics: NotificationStatistics;
}

export function mapNotificationItem(dto: NotificationItemDto): NotificationItem {
  return createNotificationItem({
    id: dto.id,
    title: dto.title,
    message: dto.message,
    category: dto.category,
    priority: dto.priority,
    state: dto.state,
    icon: dto.icon,
    createdAt: dto.createdAt,
    readAt: dto.readAt,
    expiresAt: dto.expiresAt,
    actions: dto.actions.map((a) =>
      createNotificationAction({
        ...a,
        destination: a.destination ?? null,
      }),
    ),
    destination: dto.destination ?? null,
  });
}

export function mapReminder(dto: ReminderDto): Reminder {
  return createReminder({
    id: dto.id,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    schedule: createReminderSchedule(dto.schedule),
    deliveryPolicy: dto.deliveryPolicy,
    enabled: dto.enabled,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  });
}

export function mapCoachNotification(dto: CoachNotificationDto): CoachNotification {
  return createCoachNotification({
    id: dto.id,
    title: dto.title,
    message: dto.message,
    category: dto.category,
    priority: dto.priority,
    state: dto.state,
    coachContext: dto.coachContext,
    actionDestination: dto.actionDestination ?? null,
    createdAt: dto.createdAt,
    readAt: dto.readAt,
  });
}

export function mapNotificationSettings(dto: NotificationSettingsDto): NotificationSettings {
  return createNotificationSettings(dto);
}

export function mapNotificationStatistics(dto: NotificationStatisticsDto): NotificationStatistics {
  return createNotificationStatistics(dto);
}

export function mapNotificationCenterData(dto: NotificationCenterDataDto): NotificationCenterData {
  return Object.freeze({
    notifications: Object.freeze(dto.notifications.map(mapNotificationItem)),
    reminders: Object.freeze(dto.reminders.map(mapReminder)),
    coachNotifications: Object.freeze(dto.coachNotifications.map(mapCoachNotification)),
    settings: mapNotificationSettings(dto.settings),
    statistics: mapNotificationStatistics(dto.statistics),
  });
}
