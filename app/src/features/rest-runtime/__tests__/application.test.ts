import {
  cancelRest,
  completeRest,
  pauseRest,
  resumeRest,
  startRest,
  updateElapsedTime,
} from "../application";
import { RestRuntimeError } from "../models/RestRuntimeError";
import {
  FIXED_TIMESTAMP,
  createMinimalRestSession,
} from "../testSupport/fixtures";

describe("rest-runtime application API", () => {
  it("exposes lifecycle without leaking engine internals", () => {
    const rest = startRest(createMinimalRestSession(), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });

    expect(rest.getState()).toBe("Running");
    expect(Object.keys(rest)).not.toContain("engine");

    expect(pauseRest(rest).state).toBe("Paused");
    expect(resumeRest(rest).state).toBe("Running");

    updateElapsedTime(rest, 20_000);
    expect(rest.getElapsedMs()).toBe(20_000);

    const result = completeRest(rest);
    expect(result.finalState).toBe("Completed");
    expect(rest.isTerminal()).toBe(true);
  });

  it("supports cancel via public API", () => {
    const rest = startRest(createMinimalRestSession(), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });
    const result = cancelRest(rest);
    expect(result.finalState).toBe("Cancelled");
  });

  it("rejects invalid application operations", () => {
    const rest = startRest(createMinimalRestSession(), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });
    pauseRest(rest);
    expect(() => updateElapsedTime(rest, 5_000)).toThrow(RestRuntimeError);
  });

  it("returns public summaries only from mutations", () => {
    const rest = startRest(createMinimalRestSession(), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });
    const summary = updateElapsedTime(rest, 15_000);
    expect(summary).toMatchObject({
      runtimeId: expect.any(String),
      sessionId: expect.any(String),
      state: "Running",
      elapsedMs: 15_000,
    });
    expect(summary).not.toHaveProperty("events");
    expect(summary).not.toHaveProperty("session");
  });
});
