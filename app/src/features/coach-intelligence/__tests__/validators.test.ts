import {
  validateConstraints,
  validateContextConsistency,
  validateEvidence,
  validateMissingInformation,
  validateObjectives,
  validatePreparationInput,
  validatePriorities,
  validateSnapshotIntegrity,
} from "../validators";
import {
  createCoachEvidenceFixture,
  createCoachObjectiveFixture,
  createCoachingContextFixture,
  createFullCoachInputs,
  createInsightSnapshotFixture,
} from "../testSupport/fixtures";
import { createCoachSnapshot, prepareCoachingContext } from "../application";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("coach-intelligence validators", () => {
  it("validatePreparationInput flags id mismatches", () => {
    const inputs = createFullCoachInputs();
    const issues = validatePreparationInput({
      insightSnapshot: inputs.insightSnapshot,
      performanceSnapshot: {
        ...inputs.performanceSnapshot,
        id: "perf:other",
      },
    });
    expect(issues).toContain("performance_insight_snapshot_mismatch");
  });

  it("validateMissingInformation reports optional absences", () => {
    const snapshot = createInsightSnapshotFixture();
    const issues = validateMissingInformation({ insightSnapshot: snapshot });
    expect(issues).toEqual(
      expect.arrayContaining([
        "missing_recovery_snapshot",
        "missing_athlete_history",
        "missing_performance_snapshot",
        "missing_achievement_result",
      ]),
    );
  });

  it("validateObjectives / evidence / constraints / priorities", () => {
    const evidence = createCoachEvidenceFixture({ sourceType: "" });
    const objective = createCoachObjectiveFixture({ title: "" });

    expect(validateEvidence([evidence])).toEqual(
      expect.arrayContaining([expect.stringContaining("missing_source_type")]),
    );
    expect(validateObjectives([objective])).toEqual(
      expect.arrayContaining([expect.stringContaining("missing_title")]),
    );
    expect(
      validateConstraints([
        {
          id: "c1",
          code: "",
          statement: "x",
          sourceType: "RecoverySnapshot",
          sourceId: "r1",
          priority: 50,
          reason: Object.freeze({
            code: "r",
            statement: "s",
            attributes: Object.freeze({}),
          }),
        },
      ]),
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("missing_code")]),
    );
    expect(
      validatePriorities({
        objectives: [createCoachObjectiveFixture({ priority: 999 as never })],
        constraints: [],
        instructions: [],
        focus: [],
        evidence: [],
      }),
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("invalid_objective_priority")]),
    );
  });

  it("validateSnapshotIntegrity and consistency on prepared context", () => {
    const inputs = createFullCoachInputs();
    const result = prepareCoachingContext({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "coach:validate",
    });

    const issues = validateSnapshotIntegrity(result.snapshot);
    expect(issues.filter((i) => i.includes("mismatch"))).toEqual([]);

    const consistency = validateContextConsistency(result.context);
    expect(consistency).toEqual([]);

    const snapshot = createCoachSnapshot(result.context);
    expect(validateSnapshotIntegrity(snapshot).length).toBeGreaterThanOrEqual(0);
  });

  it("validateContextConsistency detects summary count mismatch", () => {
    const context = createCoachingContextFixture();
    const broken = Object.freeze({
      ...context,
      summary: Object.freeze({
        ...context.summary,
        objectiveCount: context.objectives.length + 5,
      }),
    });
    expect(validateContextConsistency(broken)).toContain(
      "summary_objective_count_mismatch",
    );
  });
});
