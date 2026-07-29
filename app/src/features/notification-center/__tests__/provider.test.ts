import { backendNotificationCenterService } from "../providers/BackendNotificationCenterService";
import { localNotificationCenterService } from "../providers/LocalNotificationCenterService";
import { mockNotificationCenterService, emptyMockNotificationCenterService } from "../providers/MockNotificationCenterService";

describe("notification-center providers", () => {
  it("mock provider returns data", async () => {
    const data = await mockNotificationCenterService.getNotifications();
    expect(data.notifications.length).toBeGreaterThan(0);
    expect(data.reminders.length).toBeGreaterThan(0);
  });

  it("empty mock provider returns empty collections", async () => {
    const data = await emptyMockNotificationCenterService.getNotifications();
    expect(data.notifications.length).toBe(0);
    expect(data.reminders.length).toBe(0);
  });

  it("backend provider throws", async () => {
    await expect(backendNotificationCenterService.getNotifications()).rejects.toThrow("Backend");
  });

  it("local provider throws", async () => {
    await expect(localNotificationCenterService.getNotifications()).rejects.toThrow("Local");
  });

  it("mock provider dismisses notification", async () => {
    const data = await mockNotificationCenterService.dismissNotification("notif-001");
    const n = data.notifications.find((n) => n.id === "notif-001");
    expect(n?.state).toBe("dismissed");
  });

  it("mock provider marks notification read", async () => {
    const data = await mockNotificationCenterService.markNotificationRead("notif-002");
    const n = data.notifications.find((n) => n.id === "notif-002");
    expect(n?.readAt).not.toBeNull();
  });
});
