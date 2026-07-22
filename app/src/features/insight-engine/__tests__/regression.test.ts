import { generateInsights } from "../application";
import { InsightTypes } from "../models/InsightType";
import {
  createFullInsightInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { sortInsights } from "../utils/sortInsights";
import { normalizePriority } from "../utils/normalizePriorities";

describe("insight-engine regression", () => {
  it("keeps sorted priority order stable across runs", () => {
    const inputs = createFullInsightInputs();
    const a = generateInsights({
      ...inputs,
      generatedAt: FIXED_TIMESTAMP,
      snapshotId: "insight:regression",
    });
    const b = generateInsights({
      ...inputs,
      generatedAt: FIXED_TIMESTAMP,
      snapshotId: "insight:regression",
    });

    const idsA = a.collection.insights.map((i) => i.id);
    const idsB = b.collection.insights.map((i) => i.id);
    expect(idsA).toEqual(idsB);

    const resorted = sortInsights(a.collection.insights).map((i) => i.id);
    expect(resorted).toEqual(idsA);
  });

  it("normalizes out-of-range priorities", () => {
    expect(normalizePriority(0)).toBe(1);
    expect(normalizePriority(101)).toBe(100);
    expect(normalizePriority(Number.NaN)).toBe(50);
  });

  it("never emits recommendation or conversational language markers in titles", () => {
    const inputs = createFullInsightInputs();
    const result = generateInsights({
      ...inputs,
      generatedAt: FIXED_TIMESTAMP,
    });

    for (const insight of result.collection.insights) {
      expect(insight.statement.toLowerCase()).not.toMatch(
        /\b(should|recommend|try to|please|let's)\b/,
      );
      expect(insight.title.toLowerCase()).not.toMatch(/\brecommend/);
    }

    expect(
      result.collection.insights.some((i) => i.type === InsightTypes.COACH),
    ).toBe(false);
  });
});
