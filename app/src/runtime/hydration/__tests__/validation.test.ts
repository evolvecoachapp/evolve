import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { createHydrationState } from "../HydrationState";
import { HYDRATION_STATUS } from "../HydrationStatus";
import { HydrationError } from "../HydrationError";
import { resetRepositoryHydration } from "../RepositoryHydrationPipeline";
import {
  validateBootstrapReadyForHydration,
  validateHydrationCanStart,
  validateHydrationState,
} from "../HydrationValidation";

describe("repository hydration validation", () => {
  afterEach(() => {
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("validates hydration state invariants", () => {
    expect(() =>
      validateHydrationState(
        createHydrationState({ status: HYDRATION_STATUS.ready, result: null }),
      ),
    ).toThrow(HydrationError);

    expect(() =>
      validateHydrationState(
        createHydrationState({ status: HYDRATION_STATUS.failed, error: null }),
      ),
    ).toThrow(HydrationError);

    expect(() =>
      validateHydrationState(
        createHydrationState({
          status: HYDRATION_STATUS.hydrating,
          completedAt: "2026-08-10T10:00:00.000Z",
        }),
      ),
    ).toThrow(HydrationError);
  });

  it("prevents duplicate hydration starts", () => {
    expect(() =>
      validateHydrationCanStart(
        createHydrationState({ status: HYDRATION_STATUS.hydrating }),
      ),
    ).toThrow(/already started/i);

    expect(() =>
      validateHydrationCanStart(
        createHydrationState({ status: HYDRATION_STATUS.ready }),
      ),
    ).toThrow(/already started/i);
  });

  it("requires bootstrap readiness before hydration", () => {
    expect(() => validateBootstrapReadyForHydration()).toThrow(
      /bootstrap must complete/i,
    );
  });

  it("allows hydration when bootstrap is ready", () => {
    RuntimeBootstrap.bootstrap();

    expect(() => validateBootstrapReadyForHydration()).not.toThrow();
  });
});
