import { createRuntimeWriteThroughResult } from "../RuntimeWriteThroughResult";
import { createRuntimeWriteThroughState } from "../RuntimeWriteThroughState";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../RuntimeWriteThroughStatus";
import { RuntimeWriteThroughError } from "../RuntimeWriteThroughError";
import { RUNTIME_WRITE_THROUGH_PHASES } from "../RuntimeWriteThroughInitialization";

describe("runtime write-through immutability", () => {
  it("freezes write-through state and results", () => {
    const result = createRuntimeWriteThroughResult({
      identityRecordCount: 1,
      runtimeRecordCount: 1,
      workspaceRecordCount: 1,
      persistedAt: "2026-08-10T10:00:00.000Z",
      phases: RUNTIME_WRITE_THROUGH_PHASES,
    });

    const state = createRuntimeWriteThroughState({
      status: RUNTIME_WRITE_THROUGH_STATUS.ready,
      result,
      startedAt: "2026-08-10T09:59:59.000Z",
      completedAt: "2026-08-10T10:00:00.000Z",
    });

    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.phases)).toBe(true);
  });

  it("freezes failed write-through state with errors", () => {
    const error = new RuntimeWriteThroughError(
      "Repository contract rejected write-through persistence",
      "repository_contract_failed",
    );

    const state = createRuntimeWriteThroughState({
      status: RUNTIME_WRITE_THROUGH_STATUS.failed,
      error,
      startedAt: "2026-08-10T09:59:59.000Z",
      completedAt: "2026-08-10T10:00:00.000Z",
    });

    expect(Object.isFrozen(state)).toBe(true);
  });
});
