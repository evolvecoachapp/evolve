import { WorkoutRuntimeBuilder } from "../builders";
import { createMinimalWorkoutSession } from "../testSupport/fixtures";
import {
  validateRuntimeStructure,
  validateSessionForRuntime,
} from "../utils";
import {
  validateExerciseProgression,
  validateSetProgression,
  validateStateTransition,
  validateWorkoutCompletion,
} from "../validators";
import { WorkoutRuntimeEngine } from "../runtime/WorkoutRuntimeEngine";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("workout-runtime validators", () => {
  it("validates empty sessions", () => {
    const session = createMinimalWorkoutSession({
      exercises: Object.freeze([]),
    });
    expect(validateSessionForRuntime(session)).toContain("empty_session");
  });

  it("validates runtime structure against session", () => {
    const session = createMinimalWorkoutSession();
    const runtime = new WorkoutRuntimeBuilder().build({ session });
    expect(validateRuntimeStructure(runtime)).toEqual([]);
  });

  it("flags set progression outside Running", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });
    engine.pause();
    const issues = validateSetProgression(engine.getSnapshot());
    expect(issues.some((issue) => issue.includes("requires_running"))).toBe(
      true,
    );
  });

  it("flags exercise progression when not active runtime", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });
    engine.pause();
    expect(validateExerciseProgression(engine.getSnapshot()).length).toBeGreaterThan(
      0,
    );
  });

  it("validates workout completion unfinished exercises", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });
    const issues = validateWorkoutCompletion(engine.getSnapshot());
    expect(
      issues.some((issue) => issue.startsWith("unfinished_exercises")),
    ).toBe(true);
  });

  it("validates noop transitions", () => {
    expect(validateStateTransition("Running", "Running")).toEqual([
      "noop_transition:Running",
    ]);
  });
});
