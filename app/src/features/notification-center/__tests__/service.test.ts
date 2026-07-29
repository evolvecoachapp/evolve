import { createNotificationCenterService } from "../services/notificationCenterFactory";

describe("notification-center service factory", () => {
  it("creates a service with a valid provider id", () => {
    const service = createNotificationCenterService();
    expect(["mock", "backend", "local"]).toContain(service.providerId);
  });

  it("defaults to mock provider", () => {
    const service = createNotificationCenterService();
    expect(service.providerId).toBe("mock");
  });
});
