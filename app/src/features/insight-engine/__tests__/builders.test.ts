import {
  InsightBuilder,
  InsightSnapshotBuilder,
  InsightSummaryBuilder,
} from "../builders";
import { InsightCategories } from "../models/InsightCategory";
import { InsightSeverities } from "../models/InsightSeverity";
import { InsightTypes } from "../models/InsightType";
import {
  createInsightCollectionFixture,
  createInsightContext,
  createInsightFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("insight builders", () => {
  it("InsightBuilder freezes a complete insight", () => {
    const insight = new InsightBuilder()
      .withId("insight:builder")
      .withType(InsightTypes.PERFORMANCE)
      .withCategory(InsightCategories.GRADE)
      .withSeverity(InsightSeverities.INFO)
      .withPriority(60)
      .withTitle("Builder title")
      .withStatement("Builder statement.")
      .withReason({
        code: "builder",
        statement: "built",
        attributes: Object.freeze({}),
      })
      .withEvidence({
        sourceType: "PerformanceSnapshot",
        sourceId: "perf-1",
        attributes: Object.freeze({}),
      })
      .withGeneratedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(insight)).toBe(true);
    expect(insight.priority).toBe(60);
  });

  it("InsightBuilder rejects incomplete insights", () => {
    expect(() => new InsightBuilder().build()).toThrow(
      "InsightBuilder missing required fields",
    );
  });

  it("InsightSummaryBuilder and InsightSnapshotBuilder produce frozen artifacts", () => {
    const collection = createInsightCollectionFixture([createInsightFixture()]);
    const summary = new InsightSummaryBuilder()
      .withIds({ snapshotId: "insight:snap", athleteId: null })
      .withInsightCount(collection.count)
      .withCountsByType(collection.countsByType)
      .withHighestSeverity(InsightSeverities.INFO)
      .withTopInsightIds(collection.insights.map((i) => i.id))
      .withSummaryText("1 deterministic insight.")
      .build();

    const snapshot = new InsightSnapshotBuilder()
      .withId("insight:snap")
      .withContext(createInsightContext())
      .withCollection(collection)
      .withSummary(summary)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(snapshot.summary.snapshotId).toBe("insight:snap");
  });
});
