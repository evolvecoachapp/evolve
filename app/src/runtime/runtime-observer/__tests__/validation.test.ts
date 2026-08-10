import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { resetRuntimeWriteThrough } from "../../write-through/RuntimeWriteThroughPipeline";
import { createRuntimeObserverState } from "../RuntimeObserverState";
import { RUNTIME_OBSERVER_STATUS } from "../RuntimeObserverStatus";
import { RuntimeObserverError } from "../RuntimeObserverError";
import { resetRuntimeObserver } from "../RuntimeObserver";
import {
  validateRuntimeObserverCanStart,
  validateRuntimeObserverState,
} from "../RuntimeObserverValidation";

describe("runtime observer validation", () => {
  afterEach(() => {
    resetRuntimeObserver();
    resetRuntimeWriteThrough();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("validates observer state invariants", () => {
    expect(() =>
      validateRuntimeObserverState(
        createRuntimeObserverState({
          status: RUNTIME_OBSERVER_STATUS.ready,
          result: null,
        }),
      ),
    ).toThrow(RuntimeObserverError);

    expect(() =>
      validateRuntimeObserverState(
        createRuntimeObserverState({
          status: RUNTIME_OBSERVER_STATUS.failed,
          error: null,
        }),
      ),
    ).toThrow(RuntimeObserverError);

    expect(() =>
      validateRuntimeObserverState(
        createRuntimeObserverState({
          status: RUNTIME_OBSERVER_STATUS.observing,
          completedAt: "2026-08-10T10:00:00.000Z",
        }),
      ),
    ).toThrow(RuntimeObserverError);
  });

  it("prevents duplicate observer starts", () => {
    expect(() =>
      validateRuntimeObserverCanStart(
        createRuntimeObserverState({
          status: RUNTIME_OBSERVER_STATUS.observing,
        }),
      ),
    ).toThrow(/already started/i);

    expect(() =>
      validateRuntimeObserverCanStart(
        createRuntimeObserverState({
          status: RUNTIME_OBSERVER_STATUS.ready,
        }),
      ),
    ).toThrow(/already started/i);
  });
});
