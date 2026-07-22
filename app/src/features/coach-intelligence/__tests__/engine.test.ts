import { CoachEngineError } from "../models/CoachEngineError";
import { createCoachIntelligenceEngine } from "../engine";
import {
  createFullCoachInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coach-intelligence engine", () => {
  it("prepare produces frozen CoachingContext from InsightSnapshot", () => {
    const engine = createCoachIntelligenceEngine();
    const inputs = createFullCoachInputs();

    const result = engine.prepare({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "coach:engine",
    });

    expect(result.context.id).toBe("coach:engine");
    expect(Object.isFrozen(result.context)).toBe(true);
    expect(result.context.session.insightSnapshotId).toBe(
      inputs.insightSnapshot.id,
    );
    expect(result.context.knowledge.recoveryReferenced).toBe(true);
    expect(result.context.knowledge.historyReferenced).toBe(true);
    expect(result.context.instructions.length).toBe(
      result.context.objectives.length,
    );
  });

  it("throws when InsightSnapshot is missing", () => {
    const engine = createCoachIntelligenceEngine();
    expect(() =>
      engine.prepare({
        insightSnapshot: undefined as never,
      }),
    ).toThrow(CoachEngineError);
  });

  it("records missing optional references as soft validation issues", () => {
    const engine = createCoachIntelligenceEngine();
    const inputs = createFullCoachInputs();

    const result = engine.prepare({
      insightSnapshot: inputs.insightSnapshot,
      preparedAt: FIXED_TIMESTAMP,
    });

    expect(result.validationIssues).toEqual(
      expect.arrayContaining([
        "missing_recovery_snapshot",
        "missing_athlete_history",
      ]),
    );
    expect(result.context.preparation.missingInformation).toEqual(
      expect.arrayContaining(["missing_recovery_snapshot"]),
    );
  });

  it("createSnapshot and summarize round-trip", () => {
    const engine = createCoachIntelligenceEngine();
    const inputs = createFullCoachInputs();
    const prepared = engine.prepare({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "coach:roundtrip",
    });

    const snapshot = engine.createSnapshot(prepared.context);
    expect(snapshot.id).toBe(prepared.context.id);
    expect(engine.summarize(snapshot).contextId).toBe(prepared.context.id);
    expect(engine.summarize(prepared.context).objectiveCount).toBe(
      prepared.context.objectives.length,
    );
  });
});
