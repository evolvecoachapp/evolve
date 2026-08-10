import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { createRuntimeSessionState } from "../RuntimeSessionState";
import { RUNTIME_SESSION_STATUS } from "../RuntimeSessionStatus";
import { RuntimeSessionError } from "../RuntimeSessionError";
import {
  resetRuntimeSession,
} from "../RuntimeSessionOrchestrator";
import {
  validateRuntimeSessionCanStart,
  validateRuntimeSessionState,
} from "../RuntimeSessionValidation";

describe("runtime session validation", () => {
  afterEach(() => {
    resetRuntimeSession();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("validates session state invariants", () => {
    expect(() =>
      validateRuntimeSessionState(
        createRuntimeSessionState({
          status: RUNTIME_SESSION_STATUS.ready,
          result: null,
        }),
      ),
    ).toThrow(RuntimeSessionError);

    expect(() =>
      validateRuntimeSessionState(
        createRuntimeSessionState({
          status: RUNTIME_SESSION_STATUS.failed,
          error: null,
        }),
      ),
    ).toThrow(RuntimeSessionError);

    expect(() =>
      validateRuntimeSessionState(
        createRuntimeSessionState({
          status: RUNTIME_SESSION_STATUS.starting,
          completedAt: "2026-08-10T10:00:00.000Z",
        }),
      ),
    ).toThrow(RuntimeSessionError);
  });

  it("prevents duplicate session starts", () => {
    expect(() =>
      validateRuntimeSessionCanStart(
        createRuntimeSessionState({
          status: RUNTIME_SESSION_STATUS.starting,
        }),
      ),
    ).toThrow(/already started/i);

    expect(() =>
      validateRuntimeSessionCanStart(
        createRuntimeSessionState({
          status: RUNTIME_SESSION_STATUS.ready,
        }),
      ),
    ).toThrow(/already started/i);
  });
});
