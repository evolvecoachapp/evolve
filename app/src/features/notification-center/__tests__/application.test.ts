import {
  createNewReminder,
  deleteReminder,
  dismissNotification,
  getNotificationStatistics,
  loadNotifications,
  markNotificationRead,
  refreshNotifications,
  updateNotificationSettings,
  updateReminder,
} from "../application";
import {
  emptyMockNotificationCenterService,
  mockNotificationCenterService,
} from "../providers/MockNotificationCenterService";
import type { NotificationCenterService } from "../services";
import { NotificationCenterError } from "../services";

function createFailingService(): NotificationCenterService {
  return {
    providerId: "mock",
    async getNotifications() { throw new NotificationCenterError("load failed", "mock"); },
    async dismissNotification() { throw new NotificationCenterError("dismiss failed", "mock"); },
    async markNotificationRead() { throw new NotificationCenterError("read failed", "mock"); },
    async createReminder() { throw new NotificationCenterError("create failed", "mock"); },
    async updateReminder() { throw new NotificationCenterError("update failed", "mock"); },
    async deleteReminder() { throw new NotificationCenterError("delete failed", "mock"); },
    async updateSettings() { throw new NotificationCenterError("settings failed", "mock"); },
    async getStatistics() { throw new NotificationCenterError("stats failed", "mock"); },
  };
}

describe("notification-center application APIs", () => {
  it("loads notifications with immutable data", async () => {
    const data = await loadNotifications({ service: mockNotificationCenterService });
    expect(Object.isFrozen(data)).toBe(true);
    expect(Object.isFrozen(data.notifications)).toBe(true);
    expect(data.notifications.length).toBeGreaterThan(0);
  });

  it("refresh returns fresh mapped data", async () => {
    const first = await loadNotifications({ service: mockNotificationCenterService });
    const second = await refreshNotifications({ service: mockNotificationCenterService });
    expect(second).not.toBe(first);
    expect(second.notifications.length).toBe(first.notifications.length);
  });

  it("dismisses a notification", async () => {
    const data = await dismissNotification({ service: mockNotificationCenterService, notificationId: "notif-001" });
    const dismissed = data.notifications.find((n) => n.id === "notif-001");
    expect(dismissed?.state).toBe("dismissed");
  });

  it("marks a notification as read", async () => {
    const data = await markNotificationRead({ service: mockNotificationCenterService, notificationId: "notif-002" });
    const read = data.notifications.find((n) => n.id === "notif-002");
    expect(read?.readAt).not.toBeNull();
  });

  it("creates a reminder", async () => {
    const newReminder = {
      id: "rem-new",
      type: "custom" as const,
      title: "Custom Reminder",
      message: "Test reminder",
      schedule: { dayOfWeek: [1, 3, 5], timeOfDay: "08:00", deliveryPolicy: "daily" as const, enabled: true },
      deliveryPolicy: "daily" as const,
      enabled: true,
      createdAt: "2026-07-29T08:00:00Z",
      updatedAt: "2026-07-29T08:00:00Z",
    };
    const data = await createNewReminder({ service: mockNotificationCenterService, reminder: newReminder });
    expect(data.reminders.find((r) => r.id === "rem-new")).toBeTruthy();
  });

  it("updates a reminder", async () => {
    const existingData = await loadNotifications({ service: mockNotificationCenterService });
    const first = existingData.reminders[0];
    const updated = { ...first, title: "Updated Title", schedule: { ...first.schedule } };
    const data = await updateReminder({ service: mockNotificationCenterService, reminder: updated });
    expect(data.reminders.find((r) => r.id === first.id)?.title).toBe("Updated Title");
  });

  it("deletes a reminder", async () => {
    const before = await loadNotifications({ service: mockNotificationCenterService });
    const countBefore = before.reminders.length;
    const data = await deleteReminder({ service: mockNotificationCenterService, reminderId: before.reminders[0].id });
    expect(data.reminders.length).toBeLessThan(countBefore);
  });

  it("updates notification settings", async () => {
    const data = await updateNotificationSettings({
      service: mockNotificationCenterService,
      settings: {
        workoutReminders: false,
        nutritionReminders: false,
        hydrationReminders: false,
        recoveryReminders: false,
        sleepReminders: false,
        coachMessages: false,
        progressUpdates: false,
        globalDeliveryPolicy: "disabled",
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
      },
    });
    expect(data.settings.workoutReminders).toBe(false);
    expect(data.settings.globalDeliveryPolicy).toBe("disabled");
  });

  it("gets notification statistics", async () => {
    const stats = await getNotificationStatistics({ service: mockNotificationCenterService });
    expect(Object.isFrozen(stats)).toBe(true);
    expect(stats.totalNotifications).toBeGreaterThanOrEqual(0);
  });

  it("supports empty notification state", async () => {
    const data = await loadNotifications({ service: emptyMockNotificationCenterService });
    expect(data.notifications.length).toBe(0);
    expect(data.reminders.length).toBe(0);
  });

  it("propagates provider failures", async () => {
    await expect(loadNotifications({ service: createFailingService() })).rejects.toThrow("load failed");
  });
});
