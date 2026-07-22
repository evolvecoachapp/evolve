import { createEmptyProgressionScore } from "../../../progression/models/ProgressionScore";
import { createWorkoutBlueprint } from "../../../workout-blueprint/testSupport/fixtures";
import { TrainingAdaptationError } from "../../models/TrainingAdaptationError";
import {
  createSampleProgressionPlan,
  createTrainingAdaptationRequest,
} from "../../testSupport/fixtures";
import {
  FIXED_ADAPTATION_TIMESTAMP,
  TrainingAdaptationEngine,
} from "../TrainingAdaptationEngine";

function createEngine() {
  return new TrainingAdaptationEngine();
}

describe("TrainingAdaptationEngine", () => {
  it("evaluates a deterministic adaptation result", async () => {
    const engine = createEngine();
    const request = await createTrainingAdaptationRequest();

    const first = await engine.evaluate(request);
    const second = await engine.evaluate(request);

    expect(first.readiness.overallScore).toBe(second.readiness.overallScore);
    expect(first.adaptedAt).toBe(FIXED_ADAPTATION_TIMESTAMP);
    expect(first.recommendations).toEqual(second.recommendations);
    expect(Object.isFrozen(first)).toBe(true);
    expect(first.requestId).toContain("adaptation:");
  });

  it("produces readiness without wearable or athlete fields", async () => {
    const engine = createEngine();
    const result = await engine.evaluate(await createTrainingAdaptationRequest());

    expect(result.readiness.recovery.status).toBeDefined();
    expect(result.readiness.fatigue.level).toBeDefined();
    expect(result).not.toHaveProperty("heartRate");
    expect(result).not.toHaveProperty("hrv");
    expect(result).not.toHaveProperty("sleep");
    expect(result).not.toHaveProperty("whoop");
    expect(result.adaptedProgression.sourcePlan.requestId).toContain(
      "progression:",
    );
  });

  it("returns recommendations without mutating the source plan", async () => {
    const engine = createEngine();
    const request = await createTrainingAdaptationRequest();
    const before = request.progression.timeline.map(
      (step) => step.target.volumeSets,
    );
    const result = await engine.evaluate(request);
    const after = result.adaptedProgression.sourcePlan.timeline.map(
      (step) => step.target.volumeSets,
    );

    expect(after).toEqual(before);
    expect(result.adaptedProgression.sourcePlanRequestId).toBe(
      request.progression.requestId,
    );
  });

  it("throws on empty progression", async () => {
    const engine = createEngine();
    const progression = await createSampleProgressionPlan();
    const empty = Object.freeze({
      ...progression,
      exerciseProgressions: Object.freeze([]),
      timeline: Object.freeze([]),
      score: createEmptyProgressionScore(),
    });

    await expect(
      engine.evaluate(
        await createTrainingAdaptationRequest({ progression: empty }),
      ),
    ).rejects.toBeInstanceOf(TrainingAdaptationError);
  });

  it("throws on blueprint / progression mismatch", async () => {
    const engine = createEngine();
    const otherBlueprint = createWorkoutBlueprint({ id: "bp-other" });
    const request = await createTrainingAdaptationRequest({
      blueprint: otherBlueprint,
    });

    await expect(engine.evaluate(request)).rejects.toBeInstanceOf(
      TrainingAdaptationError,
    );
  });

  it("preview includes explanations", async () => {
    const engine = createEngine();
    const preview = await engine.preview(
      await createTrainingAdaptationRequest({ includeExplanations: false }),
    );
    expect(preview.explanations.length).toBe(preview.recommendations.length);
  });

  it("explain rebuilds explanations when absent", async () => {
    const engine = createEngine();
    const result = await engine.evaluate(
      await createTrainingAdaptationRequest({ includeExplanations: false }),
    );
    const explanations = engine.explain(result);
    expect(explanations.length).toBe(result.recommendations.length);
  });
});
