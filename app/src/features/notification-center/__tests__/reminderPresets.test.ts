import { buildPresetReminder, REMINDER_PRESETS } from "../models";

describe("buildPresetReminder", () => {
  it("builds a fully-formed, enabled reminder for every known preset type", () => {
    const at = "2026-08-11T00:00:00.000Z";

    for (const preset of REMINDER_PRESETS) {
      const reminder = buildPresetReminder(preset.type, at);

      expect(reminder.type).toBe(preset.type);
      expect(reminder.enabled).toBe(true);
      expect(reminder.createdAt).toBe(at);
      expect(reminder.updatedAt).toBe(at);
      expect(reminder.id).toBeTruthy();
      expect(reminder.schedule.enabled).toBe(true);
    }
  });

  it("generates a distinct id on each call so presets can be re-added after removal", () => {
    const first = buildPresetReminder("workout", "2026-08-11T00:00:00.000Z");
    const second = buildPresetReminder("workout", "2026-08-11T00:00:00.000Z");

    expect(first.id).not.toBe(second.id);
  });

  it("throws for an unknown reminder type rather than silently producing bad data", () => {
    expect(() => buildPresetReminder("not-a-real-type" as never, "2026-08-11T00:00:00.000Z")).toThrow();
  });
});
