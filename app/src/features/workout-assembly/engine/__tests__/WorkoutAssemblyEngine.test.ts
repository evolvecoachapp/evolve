import { createEmptyProgrammingScore } from "../../../programming/models/ProgrammingScore";
import { createWorkoutBlueprint } from "../../../workout-blueprint/testSupport/fixtures";
import { WorkoutAssemblyError } from "../../models/WorkoutAssemblyError";
import {
  createSampleAdaptationResult,
  createWorkoutAssemblyRequest,
} from "../../testSupport/fixtures";
import {
  FIXED_ASSEMBLY_TIMESTAMP,
  WorkoutAssemblyEngine,
} from "../WorkoutAssemblyEngine";

function createEngine() {
  return new WorkoutAssemblyEngine();
}

describe("WorkoutAssemblyEngine", () => {
  it("assembles a deterministic WorkoutSession", async () => {
    const engine = createEngine();
    const request = await createWorkoutAssemblyRequest();

    const first = await engine.assemble(request);
    const second = await engine.assemble(request);

    expect(first.session.id).toBe(second.session.id);
    expect(first.assembledAt).toBe(FIXED_ASSEMBLY_TIMESTAMP);
    expect(first.session.exercises).toEqual(second.session.exercises);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.session)).toBe(true);
    expect(first.requestId).toContain("assembly:");
  });

  it("produces a session without execution or analytics fields", async () => {
    const engine = createEngine();
    const result = await engine.assemble(await createWorkoutAssemblyRequest());

    expect(result.session.exercises.length).toBeGreaterThan(0);
    expect(result.session.blocks.length).toBeGreaterThan(0);
    expect(result.session.summary.exerciseCount).toBe(
      result.session.exercises.length,
    );
    expect(result).not.toHaveProperty("completedAt");
    expect(result).not.toHaveProperty("timer");
    expect(result).not.toHaveProperty("analytics");
    expect(result.session).not.toHaveProperty("status");
  });

  it("does not mutate upstream pipeline inputs", async () => {
    const engine = createEngine();
    const request = await createWorkoutAssemblyRequest();
    const beforeSets = request.programming.prescriptions.map(
      (prescription) => prescription.volume.sets,
    );
    const beforeRecs = request.adaptation.recommendations.map(
      (recommendation) => recommendation.id,
    );

    await engine.assemble(request);

    expect(
      request.programming.prescriptions.map(
        (prescription) => prescription.volume.sets,
      ),
    ).toEqual(beforeSets);
    expect(
      request.adaptation.recommendations.map(
        (recommendation) => recommendation.id,
      ),
    ).toEqual(beforeRecs);
  });

  it("throws on empty programming", async () => {
    const engine = createEngine();
    const request = await createWorkoutAssemblyRequest();
    const empty = Object.freeze({
      ...request,
      programming: Object.freeze({
        ...request.programming,
        prescriptions: Object.freeze([]),
        score: createEmptyProgrammingScore(),
      }),
    });

    await expect(engine.assemble(empty)).rejects.toBeInstanceOf(
      WorkoutAssemblyError,
    );
  });

  it("throws on blueprint / adaptation mismatch", async () => {
    const engine = createEngine();
    const otherBlueprint = createWorkoutBlueprint({ id: "bp-other" });
    const request = await createWorkoutAssemblyRequest({
      blueprint: otherBlueprint,
    });

    await expect(engine.assemble(request)).rejects.toBeInstanceOf(
      WorkoutAssemblyError,
    );
  });

  it("preview includes explanations", async () => {
    const engine = createEngine();
    const preview = await engine.preview(
      await createWorkoutAssemblyRequest({ includeExplanations: false }),
    );
    expect(preview.explanations.length).toBeGreaterThan(0);
  });

  it("explain rebuilds explanations when absent", async () => {
    const engine = createEngine();
    const result = await engine.assemble(
      await createWorkoutAssemblyRequest({ includeExplanations: false }),
    );
    const explanations = engine.explain(result);
    expect(explanations.length).toBeGreaterThan(0);
  });

  it("applies adaptation recommendations into the session", async () => {
    const engine = createEngine();
    const adaptation = await createSampleAdaptationResult();
    const result = await engine.assemble(
      await createWorkoutAssemblyRequest({ adaptation }),
    );

    expect(result.session.notes.length).toBeGreaterThan(0);
    expect(result.context.adaptationRequestId).toBe(adaptation.requestId);
    expect(result.session.weekNumber).toBe(1);
  });
});
