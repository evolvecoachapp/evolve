import { detectInactivity } from "../detectInactivity";
import { createWorkout } from "../../testSupport/fixtures";

describe("detectInactivity", () => {
  const referenceDate = new Date("2026-07-21T12:00:00.000Z");

  it("returns null for empty history", () => {
    expect(detectInactivity([], { referenceDate })).toBeNull();
  });

  it("returns null when training is recent", () => {
    const sessions = [
      createWorkout({
        id: "1",
        completedAt: "2026-07-18T12:00:00.000Z",
      }),
    ];
    expect(
      detectInactivity(sessions, { referenceDate, thresholdDays: 10 }),
    ).toBeNull();
  });

  it("flags long gaps since the last session", () => {
    const sessions = [
      createWorkout({
        id: "1",
        completedAt: "2026-07-01T12:00:00.000Z",
      }),
    ];
    const insight = detectInactivity(sessions, {
      referenceDate,
      thresholdDays: 10,
    });
    expect(insight?.kind).toBe("inactivity");
    expect(insight?.payload.daysSinceLastSession).toBe(20);
  });
});
