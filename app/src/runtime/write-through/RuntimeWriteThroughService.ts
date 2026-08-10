import type { RuntimeWriteThroughResult } from "./RuntimeWriteThroughResult";
import type { RuntimeWriteThroughState } from "./RuntimeWriteThroughState";
import { getRuntimeWriteThroughStateHolder } from "./RuntimeWriteThroughStateHolder";
import type { RuntimeWriteThroughStatus } from "./RuntimeWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "./RuntimeWriteThroughStatus";

/**
 * Read-only facade over the process-wide Runtime Write-Through state.
 * Resolved from the Composition Root after bootstrap completes.
 */
export class RuntimeWriteThroughService {
  getStatus(): RuntimeWriteThroughStatus {
    return getRuntimeWriteThroughStateHolder().status;
  }

  getState(): RuntimeWriteThroughState {
    return getRuntimeWriteThroughStateHolder();
  }

  isReady(): boolean {
    return (
      getRuntimeWriteThroughStateHolder().status ===
      RUNTIME_WRITE_THROUGH_STATUS.ready
    );
  }

  getResult(): RuntimeWriteThroughResult | null {
    return getRuntimeWriteThroughStateHolder().result;
  }
}
