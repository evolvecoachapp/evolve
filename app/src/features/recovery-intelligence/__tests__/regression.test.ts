import { analyzeRecovery } from "../application";
import {
  createFullRecoveryInputs,
  createPerformanceSnapshotFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { createAthleteHistoryFixture } from "../testSupport/fixtures";
import { RecoveryStatusLevels } from "../models/RecoveryStatus";

describe("recovery-intelligence regression", () => {
  it("is deterministic for identical inputs", () => {
    const inputs = createFullRecoveryInputs();
    const a = analyzeRecovery({
      ...inputs,
      analyzedAt: FIXED_TIMESTAMP,
      snapshotId: "recv-fixed",
      frequencyWindowDays: 7,
    });
    const b = analyzeRecovery({
      ...inputs,
      analyzedAt: FIXED_TIMESTAMP,
      snapshotId: "recv-fixed",
      frequencyWindowDays: 7,
    });

    expect(a.snapshot.metrics).toEqual(b.snapshot.metrics);
    expect(a.summary).toEqual(b.summary);
    expect(a.assessment.indicators).toEqual(b.assessment.indicators);
  });

  it("higher tonnage increases session load and fatigue", () => {
    const lowSnapshot = createPerformanceSnapshotFixture({
      tonnage: 500,
      tonnagePerMinute: 10,
    });
    const highSnapshot = createPerformanceSnapshotFixture({
      tonnage: 5000,
      tonnagePerMinute: 100,
    });

    const low = analyzeRecovery({
      athleteHistory: createAthleteHistoryFixture({
        performanceSnapshot: lowSnapshot,
      }),
      performanceSnapshot: lowSnapshot,
      analyzedAt: FIXED_TIMESTAMP,
    });
    const high = analyzeRecovery({
      athleteHistory: createAthleteHistoryFixture({
        performanceSnapshot: highSnapshot,
      }),
      performanceSnapshot: highSnapshot,
      analyzedAt: FIXED_TIMESTAMP,
    });

    expect(high.snapshot.metrics.trainingLoad.sessionLoad).toBeGreaterThan(
      low.snapshot.metrics.trainingLoad.sessionLoad,
    );
    expect(high.snapshot.metrics.fatigue.score).toBeGreaterThan(
      low.snapshot.metrics.fatigue.score,
    );
  });

  it("never emits recommendation-like fields on snapshot", () => {
    const inputs = createFullRecoveryInputs();
    const result = analyzeRecovery({
      ...inputs,
      analyzedAt: FIXED_TIMESTAMP,
    });
    const serialized = JSON.stringify(result.snapshot);
    expect(serialized.toLowerCase()).not.toContain("recommend");
    expect(serialized.toLowerCase()).not.toContain("should");
    expect(result.snapshot.metrics.status.level).toBeDefined();
    expect(
      Object.values(RecoveryStatusLevels),
    ).toContain(result.snapshot.metrics.status.level);
  });
});
