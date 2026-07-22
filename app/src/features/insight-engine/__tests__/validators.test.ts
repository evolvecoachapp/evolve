import { InsightBuilder } from "../builders";
import { InsightCategories } from "../models/InsightCategory";
import { InsightSeverities } from "../models/InsightSeverity";
import { InsightTypes } from "../models/InsightType";
import {
  createFullInsightInputs,
  createInsightCollectionFixture,
  createInsightContext,
  createInsightFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { InsightSnapshotBuilder } from "../builders/InsightSnapshotBuilder";
import { buildInsightSummary } from "../utils/summarizeInsights";
import {
  validateAnalysisInput,
  validateDuplicates,
  validateEvidence,
  validateInsightConsistency,
  validatePriorities,
  validateSeverity,
  validateSnapshotIntegrity,
} from "../validators";

describe("insight validators", () => {
  it("validateAnalysisInput flags upstream id mismatches", () => {
    const inputs = createFullInsightInputs();
    const issues = validateAnalysisInput(
      { ...inputs.performanceSnapshot, id: "other-perf" },
      inputs.achievementResult,
      inputs.recoverySnapshot,
      inputs.athleteHistory,
    );
    expect(issues).toContain("achievement_performance_snapshot_mismatch");
  });

  it("validateDuplicates detects repeated ids", () => {
    const insight = createInsightFixture({ id: "dup" });
    expect(validateDuplicates([insight, insight])).toContain(
      "duplicate_insight_id:dup",
    );
  });

  it("validatePriorities and validateSeverity catch invalid values", () => {
    const badPriority = createInsightFixture({
      id: "bad-priority",
      priority: 999 as never,
    });
    // Builder normalizes priority — craft raw object for validator
    const raw = {
      ...badPriority,
      priority: 999,
    };
    expect(validatePriorities([raw])).toContain(
      "insight_invalid_priority:bad-priority",
    );

    const badSeverity = {
      ...createInsightFixture({ id: "bad-sev" }),
      severity: "urgent" as never,
    };
    expect(validateSeverity([badSeverity])).toContain(
      "insight_invalid_severity:bad-sev",
    );
  });

  it("validateEvidence and validateInsightConsistency catch empty fields", () => {
    const insight = new InsightBuilder()
      .withId("empty-ev")
      .withType(InsightTypes.PERFORMANCE)
      .withCategory(InsightCategories.GRADE)
      .withSeverity(InsightSeverities.INFO)
      .withTitle("t")
      .withStatement("s")
      .withReason({
        code: "c",
        statement: "r",
        attributes: Object.freeze({}),
      })
      .withEvidence({
        sourceType: "",
        sourceId: "",
        attributes: Object.freeze({}),
      })
      .withGeneratedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(validateEvidence([insight])).toEqual(
      expect.arrayContaining([
        "insight_missing_evidence_source_type:empty-ev",
        "insight_missing_evidence_source_id:empty-ev",
      ]),
    );
    expect(validateInsightConsistency([insight]).length).toBe(0);
  });

  it("validateSnapshotIntegrity checks summary alignment", () => {
    const collection = createInsightCollectionFixture();
    const context = createInsightContext();
    const summary = buildInsightSummary({
      snapshotId: "wrong-id",
      athleteId: null,
      collection,
    });
    const snapshot = new InsightSnapshotBuilder()
      .withId("insight:valid")
      .withContext(context)
      .withCollection(collection)
      .withSummary(summary)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(validateSnapshotIntegrity(snapshot)).toContain(
      "summary_snapshot_id_mismatch",
    );
  });
});
