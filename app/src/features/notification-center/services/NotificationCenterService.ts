import type { DeliveryPolicy } from "../models/DeliveryPolicy";
import type { NotificationCategory } from "../models/NotificationCategory";
import type { NotificationPriority } from "../models/NotificationPriority";
import type { NotificationState } from "../models/NotificationState";
import type { ReminderType } from "../models/ReminderType";

export interface NotificationActionDto {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly destination?: string | null;
  readonly category: NotificationCategory;
}

export interface ReminderScheduleDto {
  readonly dayOfWeek: readonly number[];
  readonly timeOfDay: string;
  readonly deliveryPolicy: DeliveryPolicy;
  readonly enabled: boolean;
}

export interface ReminderDto {
  readonly id: string;
  readonly type: ReminderType;
  readonly title: string;
  readonly message: string;
  readonly schedule: ReminderScheduleDto;
  readonly deliveryPolicy: DeliveryPolicy;
  readonly enabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CoachNotificationDto {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly category: NotificationCategory;
  readonly priority: NotificationPriority;
  readonly state: NotificationState;
  readonly coachContext: string | null;
  readonly actionDestination?: string | null;
  readonly createdAt: string;
  readonly readAt: string | null;
}

export interface NotificationItemDto {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly category: NotificationCategory;
  readonly priority: NotificationPriority;
  readonly state: NotificationState;
  readonly icon: string;
  readonly createdAt: string;
  readonly readAt: string | null;
  readonly expiresAt: string | null;
  readonly actions: readonly NotificationActionDto[];
  readonly destination?: string | null;
}

export interface NotificationSettingsDto {
  readonly workoutReminders: boolean;
  readonly nutritionReminders: boolean;
  readonly hydrationReminders: boolean;
  readonly recoveryReminders: boolean;
  readonly sleepReminders: boolean;
  readonly coachMessages: boolean;
  readonly progressUpdates: boolean;
  readonly globalDeliveryPolicy: DeliveryPolicy;
  readonly quietHoursEnabled: boolean;
  readonly quietHoursStart: string;
  readonly quietHoursEnd: string;
}

export interface NotificationStatisticsDto {
  readonly totalNotifications: number;
  readonly unreadCount: number;
  readonly dismissedCount: number;
  readonly activeReminders: number;
  readonly deliveredToday: number;
  readonly pendingCount: number;
}

export interface NotificationCenterDataDto {
  readonly notifications: readonly NotificationItemDto[];
  readonly reminders: readonly ReminderDto[];
  readonly coachNotifications: readonly CoachNotificationDto[];
  readonly settings: NotificationSettingsDto;
  readonly statistics: NotificationStatisticsDto;
}

export type NotificationCenterProviderId = "mock" | "backend" | "local";

export interface NotificationCenterService {
  readonly providerId: NotificationCenterProviderId;
  getNotifications(): Promise<NotificationCenterDataDto>;
  dismissNotification(notificationId: string): Promise<NotificationCenterDataDto>;
  markNotificationRead(notificationId: string): Promise<NotificationCenterDataDto>;
  createReminder(reminder: ReminderDto): Promise<NotificationCenterDataDto>;
  updateReminder(reminder: ReminderDto): Promise<NotificationCenterDataDto>;
  deleteReminder(reminderId: string): Promise<NotificationCenterDataDto>;
  updateSettings(settings: NotificationSettingsDto): Promise<NotificationCenterDataDto>;
  getStatistics(): Promise<NotificationStatisticsDto>;
}

export class NotificationCenterError extends Error {
  constructor(message: string, readonly providerId?: NotificationCenterProviderId) {
    super(message);
    this.name = "NotificationCenterError";
  }
}
