import {
  analyzeRecovery,
  createRecoverySnapshot,
  summarizeRecovery,
} from "../application";
import {
  createFullRecoveryInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("recovery-intelligence application API", () => {
  it("analyzeRecovery returns frozen snapshot + assessment + summary", () => {
    const inputs = createFullRecoveryInputs();
    const result = analyzeRecovery({
      ...inputs,
      analyzedAt: FIXED_TIMESTAMP,
      snapshotId: "recv-app-1",
    });

    expect(result.snapshot.id).toBe("recv-app-1");
    expect(result.assessment.status.level).toBe(result.snapshot.metrics.status.level);
    expect(result.summary.snapshotId).toBe("recv-app-1");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.snapshot)).toBe(true);
    expect(Object.isFrozen(result.snapshot.metrics)).toBe(true);
  });

  it("createRecoverySnapshot freezes a snapshot from analysis parts", () => {
    const inputs = createFullRecoveryInputs();
    const { snapshot, assessment } = analyzeRecovery({
      ...inputs,
      analyzedAt: FIXED_TIMESTAMP,
    });

    const created = createRecoverySnapshot(
      {
        metrics: snapshot.metrics,
        assessment,
        context: snapshot.context,
      },
      { snapshotId: "recv-created", frozenAt: FIXED_TIMESTAMP },
    );

    expect(created.id).toBe("recv-created");
    expect(created.summary.snapshotId).toBe("recv-created");
    expect(Object.isFrozen(created)).toBe(true);
  });

  it("summarizeRecovery returns public summary from snapshot", () => {
    const inputs = createFullRecoveryInputs();
    const { snapshot } = analyzeRecovery({
      ...inputs,
      analyzedAt: FIXED_TIMESTAMP,
      snapshotId: "recv-sum",
    });
    const summary = summarizeRecovery(snapshot);
    expect(summary.snapshotId).toBe("recv-sum");
    expect(summary.summaryText).toContain("Recovery status");
  });

  it("summarizeRecovery accepts metrics parts", () => {
    const inputs = createFullRecoveryInputs();
    const { snapshot } = analyzeRecovery({
      ...inputs,
      analyzedAt: FIXED_TIMESTAMP,
    });
    const summary = summarizeRecovery({
      snapshotId: "recv-parts",
      athleteId: null,
      metrics: snapshot.metrics,
    });
    expect(summary.snapshotId).toBe("recv-parts");
    expect(summary.fatigueScore).toBe(snapshot.metrics.fatigue.score);
  });
});
