import { SERVICE_TOKENS } from "../../../core/composition/registry/ServiceMap";
import { createBootstrapResult } from "../BootstrapResult";
import { createBootstrapState } from "../BootstrapState";
import { BOOTSTRAP_STATUS } from "../BootstrapStatus";
import { RuntimeBootstrapError } from "../RuntimeBootstrapError";
import { RUNTIME_INITIALIZATION_PHASES } from "../RuntimeInitialization";

describe("runtime bootstrap immutability", () => {
  it("freezes bootstrap state and results", () => {
    const result = createBootstrapResult({
      serviceTokenCount: SERVICE_TOKENS.length,
      validatedAt: "2026-08-10T10:00:00.000Z",
      phases: RUNTIME_INITIALIZATION_PHASES,
    });

    const state = createBootstrapState({
      status: BOOTSTRAP_STATUS.ready,
      result,
      startedAt: "2026-08-10T09:59:59.000Z",
      completedAt: "2026-08-10T10:00:00.000Z",
    });

    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.phases)).toBe(true);
  });

  it("freezes failed bootstrap state with errors", () => {
    const error = new RuntimeBootstrapError(
      "Composition Root bootstrap failed",
      "composition_root_failed",
    );

    const state = createBootstrapState({
      status: BOOTSTRAP_STATUS.failed,
      error,
      startedAt: "2026-08-10T09:59:59.000Z",
      completedAt: "2026-08-10T10:00:00.000Z",
    });

    expect(Object.isFrozen(state)).toBe(true);
  });
});
