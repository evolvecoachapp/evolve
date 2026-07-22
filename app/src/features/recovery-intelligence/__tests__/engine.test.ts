import { createRecoveryIntelligenceEngine } from "../engine";
import { RecoveryEngineError } from "../models/RecoveryEngineError";
import {
  createFullRecoveryInputs,
  createPerformanceSnapshotFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { createAthleteHistoryFixture } from "../testSupport/fixtures";

describe("RecoveryIntelligenceEngine", () => {
  const engine = createRecoveryIntelligenceEngine();

  it("analyzes recovery deterministically", () => {
    const inputs = createFullRecoveryInputs();
    const a = engine.analyze({
      ...inputs,
      analyzedAt: FIXED_TIMESTAMP,
      snapshotId: "recv-engine",
    });
    const b = engine.analyze({
      ...inputs,
      analyzedAt: FIXED_TIMESTAMP,
      snapshotId: "recv-engine",
    });

    expect(a.snapshot.metrics).toEqual(b.snapshot.metrics);
    expect(a.summary.summaryText).toBe(b.summary.summaryText);
    expect(a.assessment.indicators.length).toBeGreaterThan(0);
  });

  it("works without optional workout and achievement inputs", () => {
    const performanceSnapshot = createPerformanceSnapshotFixture();
    const athleteHistory = createAthleteHistoryFixture({
      performanceSnapshot,
    });
    const result = engine.analyze({
      athleteHistory,
      performanceSnapshot,
      analyzedAt: FIXED_TIMESTAMP,
    });

    expect(result.snapshot.context.performanceSnapshotId).toBe(
      performanceSnapshot.id,
    );
    expect(result.snapshot.context.achievementEvaluationId).toBeNull();
  });

  it("throws when athlete history is missing", () => {
    expect(() =>
      engine.analyze({
        athleteHistory: null as never,
        performanceSnapshot: createPerformanceSnapshotFixture(),
      }),
    ).toThrow(RecoveryEngineError);
  });

  it("stores achievement evaluation id as reference only", () => {
    const inputs = createFullRecoveryInputs();
    const result = engine.analyze({
      ...inputs,
      analyzedAt: FIXED_TIMESTAMP,
    });
    expect(result.snapshot.context.achievementEvaluationId).toBe(
      inputs.achievementResult.evaluationId,
    );
  });
});
