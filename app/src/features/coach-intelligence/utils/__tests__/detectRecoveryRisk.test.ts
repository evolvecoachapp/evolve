import { detectRecoveryRisk } from "../detectRecoveryRisk";
import { createTrend, createWorkout } from "../../testSupport/fixtures";

describe("detectRecoveryRisk", () => {
  const referenceDate = new Date("2026-07-21T12:00:00.000Z");

  it("returns unknown recovery with empty history", () => {
    const result = detectRecoveryRisk([], createTrend("volume", []), {
      referenceDate,
    });
    expect(result.recovery.level).toBe("unknown");
    expect(result.risk).toBeNull();
  });

  it("marks recovered after several rest days", () => {
    const sessions = [
      createWorkout({
        id: "1",
        completedAt: "2026-07-10T12:00:00.000Z",
        estimatedVolumeKg: 1000,
      }),
    ];
    const result = detectRecoveryRisk(
      sessions,
      createTrend("volume", [1000, 1000, 1000, 200]),
      { referenceDate },
    );
    expect(result.recovery.level).toBe("recovered");
    expect(result.recovery.daysSinceLastSession).toBe(11);
  });

  it("flags elevated fatigue on dense high-volume weeks", () => {
    const sessions = [
      createWorkout({
        id: "1",
        completedAt: "2026-07-20T08:00:00.000Z",
        estimatedVolumeKg: 2000,
      }),
      createWorkout({
        id: "2",
        completedAt: "2026-07-20T18:00:00.000Z",
        estimatedVolumeKg: 2000,
      }),
      createWorkout({
        id: "3",
        completedAt: "2026-07-21T08:00:00.000Z",
        estimatedVolumeKg: 2000,
      }),
      createWorkout({
        id: "4",
        completedAt: "2026-07-21T10:00:00.000Z",
        estimatedVolumeKg: 2000,
      }),
    ];
    const result = detectRecoveryRisk(
      sessions,
      createTrend("volume", [800, 900, 2200, 2400]),
      { referenceDate },
    );
    expect(["elevated", "high"]).toContain(result.recovery.level);
    expect(result.recovery.fatigueScore).not.toBeNull();
    expect(result.recovery.fatigueScore!).toBeGreaterThan(0.3);
  });
});
