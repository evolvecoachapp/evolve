import { mapNotificationCenterData, mapNotificationItem, mapReminder, mapCoachNotification } from "../mappers";
import type { NotificationCenterDataDto, NotificationItemDto, ReminderDto, CoachNotificationDto } from "../services";

describe("notification-center mappers", () => {
  it("maps a notification item DTO to an immutable model", () => {
    const dto: NotificationItemDto = {
      id: "n1",
      title: "Test",
      message: "Test message",
      category: "reminder",
      priority: "normal",
      state: "delivered",
      icon: "bell",
      createdAt: "2026-01-01T00:00:00Z",
      readAt: null,
      expiresAt: null,
      actions: [{ id: "a1", label: "Do it", icon: "check", category: "reminder" }],
    };
    const result = mapNotificationItem(dto);
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.destination).toBeNull();
    expect(result.actions[0].destination).toBeNull();
  });

  it("maps a reminder DTO to an immutable model", () => {
    const dto: ReminderDto = {
      id: "r1",
      type: "workout",
      title: "Train",
      message: "Go",
      schedule: { dayOfWeek: [1], timeOfDay: "07:00", deliveryPolicy: "daily", enabled: true },
      deliveryPolicy: "daily",
      enabled: true,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };
    const result = mapReminder(dto);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.schedule.dayOfWeek)).toBe(true);
  });

  it("maps a coach notification DTO to an immutable model", () => {
    const dto: CoachNotificationDto = {
      id: "c1",
      title: "Coach says",
      message: "Rest",
      category: "coach",
      priority: "high",
      state: "delivered",
      coachContext: "context",
      createdAt: "2026-01-01T00:00:00Z",
      readAt: null,
    };
    const result = mapCoachNotification(dto);
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.actionDestination).toBeNull();
  });

  it("maps full notification center data", () => {
    const dto: NotificationCenterDataDto = {
      notifications: [],
      reminders: [],
      coachNotifications: [],
      settings: {
        workoutReminders: true,
        nutritionReminders: true,
        hydrationReminders: true,
        recoveryReminders: true,
        sleepReminders: true,
        coachMessages: true,
        progressUpdates: true,
        globalDeliveryPolicy: "immediate",
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
      },
      statistics: {
        totalNotifications: 0,
        unreadCount: 0,
        dismissedCount: 0,
        activeReminders: 0,
        deliveredToday: 0,
        pendingCount: 0,
      },
    };
    const result = mapNotificationCenterData(dto);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.settings)).toBe(true);
    expect(Object.isFrozen(result.statistics)).toBe(true);
  });
});
