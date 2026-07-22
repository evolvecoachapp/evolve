import { RestRuntimeError } from "../models/RestRuntimeError";
import { RestRuntimeEngine } from "../runtime/RestRuntimeEngine";
import {
  FIXED_TIMESTAMP,
  createMinimalRestSession,
} from "../testSupport/fixtures";
import {
  canTransitionRestState,
  validateStateTransition,
} from "../validators";

describe("rest-runtime state transitions", () => {
  it("allows the documented lifecycle graph", () => {
    expect(canTransitionRestState("Idle", "Running")).toBe(true);
    expect(canTransitionRestState("Idle", "Cancelled")).toBe(true);
    expect(canTransitionRestState("Running", "Paused")).toBe(true);
    expect(canTransitionRestState("Running", "Completed")).toBe(true);
    expect(canTransitionRestState("Running", "Cancelled")).toBe(true);
    expect(canTransitionRestState("Running", "Expired")).toBe(true);
    expect(canTransitionRestState("Paused", "Running")).toBe(true);
    expect(canTransitionRestState("Completed", "Running")).toBe(false);
    expect(canTransitionRestState("Cancelled", "Running")).toBe(false);
    expect(canTransitionRestState("Expired", "Running")).toBe(false);
  });

  it("flags noop and invalid transitions", () => {
    expect(validateStateTransition("Running", "Running")).toEqual([
      "noop_transition:Running",
    ]);
    expect(validateStateTransition("Completed", "Paused")).toEqual([
      "invalid_transition:Completed->Paused",
    ]);
  });

  it("rejects illegal engine transitions", () => {
    const engine = new RestRuntimeEngine();
    engine.start(createMinimalRestSession(), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });
    engine.complete();

    expect(() => engine.pause()).toThrow(RestRuntimeError);
    expect(() => engine.resume()).toThrow(RestRuntimeError);
  });

  it("rejects resume when not paused", () => {
    const engine = new RestRuntimeEngine();
    engine.start(createMinimalRestSession(), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });
    expect(() => engine.resume()).toThrow(RestRuntimeError);
  });
});
