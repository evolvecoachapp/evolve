import { createHydrationResult } from "../HydrationResult";
import { createHydrationState } from "../HydrationState";
import { HYDRATION_STATUS } from "../HydrationStatus";
import { HydrationError } from "../HydrationError";
import { HYDRATION_PHASES } from "../HydrationInitialization";

describe("repository hydration immutability", () => {
  it("freezes hydration state and results", () => {
    const result = createHydrationResult({
      identityRecordCount: 1,
      runtimeRecordCount: 1,
      workspaceRecordCount: 1,
      restoredAt: "2026-08-10T10:00:00.000Z",
      phases: HYDRATION_PHASES,
    });

    const state = createHydrationState({
      status: HYDRATION_STATUS.ready,
      result,
      startedAt: "2026-08-10T09:59:59.000Z",
      completedAt: "2026-08-10T10:00:00.000Z",
    });

    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.phases)).toBe(true);
  });

  it("freezes failed hydration state with errors", () => {
    const error = new HydrationError(
      "Repository hydration failed",
      "repository_contract_failed",
    );

    const state = createHydrationState({
      status: HYDRATION_STATUS.failed,
      error,
      startedAt: "2026-08-10T09:59:59.000Z",
      completedAt: "2026-08-10T10:00:00.000Z",
    });

    expect(Object.isFrozen(state)).toBe(true);
  });
});
