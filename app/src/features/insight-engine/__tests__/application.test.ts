import {
  createInsightSnapshot,
  generateInsights,
  summarizeInsights,
} from "../application";
import {
  createFullInsightInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("insight-engine application API", () => {
  it("generateInsights returns frozen snapshot via public API", () => {
    const inputs = createFullInsightInputs();
    const result = generateInsights({
      ...inputs,
      generatedAt: FIXED_TIMESTAMP,
      snapshotId: "insight:app",
    });

    expect(Object.isFrozen(result.snapshot)).toBe(true);
    expect(result.snapshot.id).toBe("insight:app");
    expect(result.collection.count).toBeGreaterThan(0);
  });

  it("createInsightSnapshot and summarizeInsights work without exposing engine", () => {
    const inputs = createFullInsightInputs();
    const generated = generateInsights({
      ...inputs,
      generatedAt: FIXED_TIMESTAMP,
      snapshotId: "insight:app-parts",
    });

    const snapshot = createInsightSnapshot({
      collection: generated.collection,
      context: generated.snapshot.context,
    });
    expect(snapshot.collection.count).toBe(generated.collection.count);

    const fromSnapshot = summarizeInsights(snapshot);
    expect(fromSnapshot.insightCount).toBe(snapshot.collection.count);

    const fromParts = summarizeInsights({
      snapshotId: "insight:app-parts",
      athleteId: null,
      collection: generated.collection,
    });
    expect(fromParts.summaryText).toContain("deterministic insight");
  });
});
