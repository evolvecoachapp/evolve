import { createInsightEngine } from "../engine";
import { InsightEngineError } from "../models/InsightEngineError";
import { InsightTypes } from "../models/InsightType";
import {
  createFullInsightInputs,
  createPerformanceSnapshotFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("InsightEngine", () => {
  const engine = createInsightEngine();

  it("generates insights deterministically", () => {
    const inputs = createFullInsightInputs();
    const a = engine.generate({
      ...inputs,
      generatedAt: FIXED_TIMESTAMP,
      snapshotId: "insight-engine",
    });
    const b = engine.generate({
      ...inputs,
      generatedAt: FIXED_TIMESTAMP,
      snapshotId: "insight-engine",
    });

    expect(a.collection.insights).toEqual(b.collection.insights);
    expect(a.summary.summaryText).toBe(b.summary.summaryText);
    expect(a.collection.count).toBeGreaterThan(0);
  });

  it("includes performance, achievement, recovery, history, and summary types", () => {
    const inputs = createFullInsightInputs();
    const result = engine.generate({
      ...inputs,
      generatedAt: FIXED_TIMESTAMP,
    });

    const types = new Set(result.collection.insights.map((i) => i.type));
    expect(types.has(InsightTypes.PERFORMANCE)).toBe(true);
    expect(types.has(InsightTypes.ACHIEVEMENT)).toBe(true);
    expect(types.has(InsightTypes.RECOVERY)).toBe(true);
    expect(types.has(InsightTypes.HISTORY)).toBe(true);
    expect(types.has(InsightTypes.SUMMARY)).toBe(true);
  });

  it("links upstream snapshot ids in context", () => {
    const inputs = createFullInsightInputs();
    const result = engine.generate({
      ...inputs,
      generatedAt: FIXED_TIMESTAMP,
    });

    expect(result.snapshot.context.performanceSnapshotId).toBe(
      inputs.performanceSnapshot.id,
    );
    expect(result.snapshot.context.achievementEvaluationId).toBe(
      inputs.achievementResult.evaluationId,
    );
    expect(result.snapshot.context.recoverySnapshotId).toBe(
      inputs.recoverySnapshot.id,
    );
    expect(result.snapshot.context.historyId).toBe(inputs.athleteHistory.id);
  });

  it("throws when performance snapshot is missing", () => {
    const inputs = createFullInsightInputs();
    expect(() =>
      engine.generate({
        ...inputs,
        performanceSnapshot: null as never,
      }),
    ).toThrow(InsightEngineError);
  });

  it("createSnapshot and summarize work from parts", () => {
    const inputs = createFullInsightInputs();
    const generated = engine.generate({
      ...inputs,
      generatedAt: FIXED_TIMESTAMP,
      snapshotId: "insight-parts",
    });

    const snapshot = engine.createSnapshot({
      collection: generated.collection,
      context: generated.snapshot.context,
    });
    expect(snapshot.collection.count).toBe(generated.collection.count);

    const summary = engine.summarize({
      snapshotId: "insight-parts",
      athleteId: null,
      collection: generated.collection,
    });
    expect(summary.insightCount).toBe(generated.collection.count);
  });

  it("reflects performance tonnage facts from the provided snapshot", () => {
    const inputs = createFullInsightInputs();
    const altPerf = createPerformanceSnapshotFixture({ tonnage: 3000 });
    const result = engine.generate({
      ...inputs,
      performanceSnapshot: altPerf,
      generatedAt: FIXED_TIMESTAMP,
    });
    expect(result.snapshot.context.performanceSnapshotId).toBe(altPerf.id);
    expect(
      result.collection.insights.some((i) => i.statement.includes("3000")),
    ).toBe(true);
  });
});
