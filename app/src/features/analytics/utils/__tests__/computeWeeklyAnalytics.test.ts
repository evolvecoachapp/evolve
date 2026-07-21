import { computeWeeklyAnalytics } from "../computeWeeklyAnalytics";
import { createWorkout } from "../../testSupport/fixtures";

describe("computeWeeklyAnalytics", () => {
  // Reference: Tuesday 2026-07-21 → current week Monday 2026-07-20
  const referenceDate = new Date("2026-07-21T15:00:00.000Z");

  it("returns zeros when history is empty", () => {
    expect(computeWeeklyAnalytics([], referenceDate)).toEqual({
      currentWeekVolumeKg: 0,
      previousWeekVolumeKg: 0,
      sessionsPerWeek: 0,
    });
  });

  it("splits volume into current and previous UTC weeks", () => {
    const sessions = [
      // Previous week (Mon 2026-07-13)
      createWorkout({
        id: "prev",
        completedAt: "2026-07-15T12:00:00.000Z",
        estimatedVolumeKg: 800,
      }),
      // Current week (Mon 2026-07-20)
      createWorkout({
        id: "cur-1",
        completedAt: "2026-07-20T12:00:00.000Z",
        estimatedVolumeKg: 500,
      }),
      createWorkout({
        id: "cur-2",
        completedAt: "2026-07-21T12:00:00.000Z",
        estimatedVolumeKg: 700,
      }),
    ];

    const result = computeWeeklyAnalytics(sessions, referenceDate);

    expect(result.currentWeekVolumeKg).toBe(1200);
    expect(result.previousWeekVolumeKg).toBe(800);
    // First session week Mon 13 → current Mon 20 = 2 weeks; 3 sessions → 1.5
    expect(result.sessionsPerWeek).toBe(1.5);
  });
});
