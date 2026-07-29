import { loadNotifications } from "../application";
import { mockNotificationCenterService } from "../providers/MockNotificationCenterService";

describe("notification-center immutability", () => {
  it("notification center data is frozen", async () => {
    const data = await loadNotifications({ service: mockNotificationCenterService });
    expect(Object.isFrozen(data)).toBe(true);
    expect(Object.isFrozen(data.notifications)).toBe(true);
    expect(Object.isFrozen(data.reminders)).toBe(true);
    expect(Object.isFrozen(data.coachNotifications)).toBe(true);
    expect(Object.isFrozen(data.settings)).toBe(true);
    expect(Object.isFrozen(data.statistics)).toBe(true);
  });

  it("individual notifications are frozen", async () => {
    const data = await loadNotifications({ service: mockNotificationCenterService });
    for (const n of data.notifications) {
      expect(Object.isFrozen(n)).toBe(true);
      expect(Object.isFrozen(n.actions)).toBe(true);
    }
  });

  it("reminders are frozen", async () => {
    const data = await loadNotifications({ service: mockNotificationCenterService });
    for (const r of data.reminders) {
      expect(Object.isFrozen(r)).toBe(true);
      expect(Object.isFrozen(r.schedule)).toBe(true);
      expect(Object.isFrozen(r.schedule.dayOfWeek)).toBe(true);
    }
  });

  it("coach notifications are frozen", async () => {
    const data = await loadNotifications({ service: mockNotificationCenterService });
    for (const cn of data.coachNotifications) {
      expect(Object.isFrozen(cn)).toBe(true);
    }
  });
});
