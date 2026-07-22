import { WorkoutRuntimeError } from "../models/WorkoutRuntimeError";
import { WorkoutRuntimeEngine } from "../runtime/WorkoutRuntimeEngine";
import { createMinimalWorkoutSession } from "../testSupport/fixtures";
import {
  canTransitionWorkoutState,
  validateStateTransition,
} from "../validators";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("workout runtime state transitions", () => {
  it("allows the documented state machine edges", () => {
    expect(canTransitionWorkoutState("NotStarted", "Running")).toBe(true);
    expect(canTransitionWorkoutState("Running", "Paused")).toBe(true);
    expect(canTransitionWorkoutState("Paused", "Running")).toBe(true);
    expect(canTransitionWorkoutState("Running", "Completed")).toBe(true);
    expect(canTransitionWorkoutState("Paused", "Completed")).toBe(true);
    expect(canTransitionWorkoutState("Running", "Cancelled")).toBe(true);
    expect(canTransitionWorkoutState("Paused", "Cancelled")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(validateStateTransition("Completed", "Running")).toEqual([
      "invalid_transition:Completed->Running",
    ]);
    expect(validateStateTransition("NotStarted", "Paused")).toEqual([
      "invalid_transition:NotStarted->Paused",
    ]);
    expect(canTransitionWorkoutState("Cancelled", "Running")).toBe(false);
  });

  it("enforces transitions on the engine", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });

    expect(() => engine.resume()).toThrow(WorkoutRuntimeError);
    engine.pause();
    expect(() => engine.pause()).toThrow(WorkoutRuntimeError);
    engine.resume();

    const cancelled = engine.cancel();
    expect(cancelled.finalState).toBe("Cancelled");
    expect(() => engine.resume()).toThrow(WorkoutRuntimeError);
  });
});
