import { createRuntimeObserverResult } from "../RuntimeObserverResult";
import { createRuntimeObserverState } from "../RuntimeObserverState";
import { RUNTIME_OBSERVER_STATUS } from "../RuntimeObserverStatus";
import { RuntimeObserverError } from "../RuntimeObserverError";
import { RUNTIME_OBSERVER_PHASES } from "../RuntimeObserverInitialization";

describe("runtime observer immutability", () => {
  it("freezes observer state and results", () => {
    const result = createRuntimeObserverResult({
      startedAt: "2026-08-10T10:00:00.000Z",
      completedAt: "2026-08-10T10:00:01.000Z",
      phases: RUNTIME_OBSERVER_PHASES,
    });

    const state = createRuntimeObserverState({
      status: RUNTIME_OBSERVER_STATUS.ready,
      result,
      startedAt: "2026-08-10T10:00:00.000Z",
      completedAt: "2026-08-10T10:00:01.000Z",
      athleteIds: ["athlete-1"],
    });

    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.phases)).toBe(true);
    expect(Object.isFrozen(result.watchedServices)).toBe(true);
    expect(Object.isFrozen(state.athleteIds)).toBe(true);
  });

  it("freezes failed observer state with errors", () => {
    const error = new RuntimeObserverError(
      "Runtime bootstrap must complete before observation can start",
      "bootstrap_not_ready",
    );

    const state = createRuntimeObserverState({
      status: RUNTIME_OBSERVER_STATUS.failed,
      error,
      startedAt: "2026-08-10T09:59:59.000Z",
      completedAt: "2026-08-10T10:00:00.000Z",
    });

    expect(Object.isFrozen(state)).toBe(true);
  });
});
