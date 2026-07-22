import { createWorkoutBlueprint } from "../../../workout-blueprint/testSupport/fixtures";
import { createEmptyProgrammingScore } from "../../../programming/models/ProgrammingScore";
import { ProgressionError } from "../../models/ProgressionError";
import {
  createProgressionRequest,
  createSampleProgrammingResult,
} from "../../testSupport/fixtures";
import { ProgressionEngine } from "../ProgressionEngine";

function createEngine() {
  return new ProgressionEngine();
}

describe("ProgressionEngine", () => {
  it("generates a deterministic multi-week progression plan", async () => {
    const engine = createEngine();
    const request = await createProgressionRequest();

    const first = await engine.generate(request);
    const second = await engine.generate(request);

    expect(first.exerciseProgressions.length).toBe(3);
    expect(first.context.window.weekCount).toBe(4);
    expect(first.timeline.length).toBe(12);
    expect(first.progressedAt).toBe(second.progressedAt);
    expect(first.timeline.map((step) => step.target.volumeSets)).toEqual(
      second.timeline.map((step) => step.target.volumeSets),
    );
    expect(Object.isFrozen(first)).toBe(true);
  });

  it("evolves prescriptions over time without load or athlete fields", async () => {
    const engine = createEngine();
    const plan = await engine.generate(await createProgressionRequest());

    for (const progression of plan.exerciseProgressions) {
      expect(progression.steps.length).toBe(4);
      expect(progression.steps[0]!.target.volumeSets).toBe(
        progression.baselineSets,
      );
      expect(progression).not.toHaveProperty("load");
      expect(progression).not.toHaveProperty("oneRepMax");
      expect(progression).not.toHaveProperty("readiness");
      expect(progression).not.toHaveProperty("fatigue");
      expect(progression).not.toHaveProperty("deload");
    }

    const primary = plan.exerciseProgressions.find(
      (entry) => entry.role === "primary",
    )!;
    const week1 = primary.steps[0]!;
    const week4 = primary.steps[3]!;
    expect(week4.target.volumeRepMax).toBeGreaterThanOrEqual(
      week1.target.volumeRepMax,
    );
  });

  it("preserves exercise continuity across weeks", async () => {
    const engine = createEngine();
    const plan = await engine.generate(await createProgressionRequest());

    for (const progression of plan.exerciseProgressions) {
      expect(
        progression.steps.every(
          (step) => step.exerciseId === progression.exerciseId,
        ),
      ).toBe(true);
    }
  });

  it("throws on empty programming", async () => {
    const engine = createEngine();
    const programming = await createSampleProgrammingResult();
    const empty = Object.freeze({
      ...programming,
      prescriptions: Object.freeze([]),
      score: createEmptyProgrammingScore(),
    });

    await expect(
      engine.generate(
        await createProgressionRequest({
          programming: empty,
        }),
      ),
    ).rejects.toBeInstanceOf(ProgressionError);
  });

  it("throws on blueprint / programming mismatch", async () => {
    const engine = createEngine();
    const otherBlueprint = createWorkoutBlueprint({ id: "bp-other" });
    const request = await createProgressionRequest({
      blueprint: otherBlueprint,
    });

    await expect(engine.generate(request)).rejects.toBeInstanceOf(
      ProgressionError,
    );
  });

  it("preview always includes explanations", async () => {
    const engine = createEngine();
    const plan = await engine.preview(
      await createProgressionRequest({ includeExplanations: false }),
    );
    expect(plan.explanations.length).toBe(plan.exerciseProgressions.length);
  });

  it("explain rebuilds when explanations were omitted", async () => {
    const engine = createEngine();
    const plan = await engine.generate(
      await createProgressionRequest({ includeExplanations: false }),
    );
    expect(plan.explanations).toEqual([]);
    const explanations = engine.explain(plan);
    expect(explanations.length).toBe(plan.exerciseProgressions.length);
    expect(explanations[0]?.summaryCode.startsWith("progressed_as_")).toBe(
      true,
    );
  });
});
