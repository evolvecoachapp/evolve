import { NotificationLoadingStatuses, NotificationSavingStatuses } from "../models";
import {
  emptyMockNotificationCenterService,
  mockNotificationCenterService,
} from "../providers/MockNotificationCenterService";
import type { NotificationCenterService } from "../services";
import { NotificationCenterError } from "../services";
import { NotificationCenterViewModel } from "../viewmodels";

describe("NotificationCenterViewModel", () => {
  it("loads notifications", async () => {
    const viewModel = new NotificationCenterViewModel({ service: mockNotificationCenterService });
    await viewModel.loadNotifications();
    expect(viewModel.loading.status).toBe(NotificationLoadingStatuses.IDLE);
    expect(viewModel.error).toBeNull();
    expect(viewModel.notifications.length).toBeGreaterThan(0);
  });

  it("exposes error state when provider fails", async () => {
    const failing: NotificationCenterService = {
      providerId: "mock",
      async getNotifications() { throw new NotificationCenterError("load failed", "mock"); },
      async dismissNotification() { throw new NotificationCenterError("fail", "mock"); },
      async markNotificationRead() { throw new NotificationCenterError("fail", "mock"); },
      async createReminder() { throw new NotificationCenterError("fail", "mock"); },
      async updateReminder() { throw new NotificationCenterError("fail", "mock"); },
      async deleteReminder() { throw new NotificationCenterError("fail", "mock"); },
      async updateSettings() { throw new NotificationCenterError("fail", "mock"); },
      async getStatistics() { throw new NotificationCenterError("fail", "mock"); },
    };
    const viewModel = new NotificationCenterViewModel({ service: failing });
    await viewModel.loadNotifications();
    expect(viewModel.notifications.length).toBe(0);
    expect(viewModel.error?.message).toContain("load failed");
  });

  it("refresh restores after a transient error", async () => {
    let calls = 0;
    const service: NotificationCenterService = {
      providerId: "mock",
      async getNotifications() {
        calls += 1;
        if (calls === 1) throw new NotificationCenterError("transient", "mock");
        return mockNotificationCenterService.getNotifications();
      },
      dismissNotification: mockNotificationCenterService.dismissNotification,
      markNotificationRead: mockNotificationCenterService.markNotificationRead,
      createReminder: mockNotificationCenterService.createReminder,
      updateReminder: mockNotificationCenterService.updateReminder,
      deleteReminder: mockNotificationCenterService.deleteReminder,
      updateSettings: mockNotificationCenterService.updateSettings,
      getStatistics: mockNotificationCenterService.getStatistics,
    };
    const viewModel = new NotificationCenterViewModel({ service });
    await viewModel.loadNotifications();
    expect(viewModel.error).not.toBeNull();
    await viewModel.refresh();
    expect(viewModel.error).toBeNull();
    expect(viewModel.notifications.length).toBeGreaterThan(0);
  });

  it("dismisses a notification", async () => {
    const viewModel = new NotificationCenterViewModel({ service: mockNotificationCenterService });
    await viewModel.loadNotifications();
    await viewModel.dismiss("notif-001");
    expect(viewModel.saving.status).toBe(NotificationSavingStatuses.IDLE);
    const n = viewModel.notifications.find((n) => n.id === "notif-001");
    expect(n?.state).toBe("dismissed");
  });

  it("marks empty state", async () => {
    const viewModel = new NotificationCenterViewModel({ service: emptyMockNotificationCenterService });
    await viewModel.loadNotifications();
    expect(viewModel.isEmpty).toBe(true);
  });

  it("notifies subscribers on load", async () => {
    const viewModel = new NotificationCenterViewModel({ service: mockNotificationCenterService });
    const listener = jest.fn();
    viewModel.subscribe(listener);
    await viewModel.loadNotifications();
    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("updates settings", async () => {
    const viewModel = new NotificationCenterViewModel({ service: mockNotificationCenterService });
    await viewModel.loadNotifications();
    await viewModel.updateSettings({
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
    });
    expect(viewModel.settings?.workoutReminders).toBe(false);
  });
});
