import {
  CoachNotification,
  NotificationPriority,
  NotificationType,
  createCoachNotification,
  createNotificationAction,
} from "../models/CoachNotification";

describe("shared notification domain", () => {
  it("creates a default coach notification with safe defaults", () => {
    const notification = createCoachNotification();

    expect(notification.id).toMatch(/^notification_/);
    expect(notification.title).toBe("New message from your coach");
    expect(notification.message).toContain("AI coach");
    expect(notification.type).toBe("coach_message");
    expect(notification.priority).toBe("medium");
    expect(notification.status).toBe("pending");
    expect(notification.read).toBe(false);
    expect(notification.actions).toEqual([]);
    expect(notification.metadata).toEqual({});
    expect(new Date(notification.expiresAt).getTime()).toBeGreaterThan(
      new Date(notification.createdAt).getTime()
    );
  });

  it("applies notification priorities and types", () => {
    const notification = createCoachNotification({
      type: "workout_reminder",
      priority: "high",
    });

    expect(notification.type).toBe("workout_reminder");
    expect(notification.priority).toBe("high");
  });

  it("creates actions with safe defaults and preserves payload", () => {
    const action = createNotificationAction({
      label: "Start workout",
      type: "open",
      payload: { workoutId: "workout-123" },
    });

    const notification = createCoachNotification({
      actions: [action],
    });

    expect(notification.actions).toHaveLength(1);
    expect(notification.actions[0]).toMatchObject({
      label: "Start workout",
      type: "open",
      payload: { workoutId: "workout-123" },
    });
  });

  it("supports partial action overrides when creating notifications", () => {
    const notification = createCoachNotification({
      actions: [{ label: "Remind me later", type: "snooze" }],
    });

    expect(notification.actions).toHaveLength(1);
    expect(notification.actions[0].id).toMatch(/^action_/);
    expect(notification.actions[0].label).toBe("Remind me later");
    expect(notification.actions[0].type).toBe("snooze");
    expect(notification.actions[0].payload).toEqual({});
  });

  it("serializes safely without losing metadata or actions", () => {
    const notification = createCoachNotification({
      type: "recovery_alert",
      priority: "critical",
      metadata: { recoveryScore: 42 },
      actions: [{ label: "Review recovery plan", type: "open" }],
    });

    const serialized = JSON.stringify(notification);
    const parsed = JSON.parse(serialized) as CoachNotification;

    expect(parsed.type).toBe("recovery_alert");
    expect(parsed.priority).toBe("critical");
    expect(parsed.metadata).toEqual({ recoveryScore: 42 });
    expect(parsed.actions).toHaveLength(1);
    expect(parsed.actions[0].label).toBe("Review recovery plan");
    expect(typeof parsed.createdAt).toBe("string");
    expect(typeof parsed.expiresAt).toBe("string");
  });
});
