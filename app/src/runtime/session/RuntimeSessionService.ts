import type { RuntimeSessionResult } from "./RuntimeSessionResult";
import type { RuntimeSessionState } from "./RuntimeSessionState";
import { getRuntimeSessionStateHolder } from "./RuntimeSessionStateHolder";
import type { RuntimeSessionStatus } from "./RuntimeSessionStatus";
import { RUNTIME_SESSION_STATUS } from "./RuntimeSessionStatus";

/**
 * Read-only facade over the process-wide Runtime Session state.
 * Resolved from the Composition Root after bootstrap completes.
 */
export class RuntimeSessionService {
  getStatus(): RuntimeSessionStatus {
    return getRuntimeSessionStateHolder().status;
  }

  getState(): RuntimeSessionState {
    return getRuntimeSessionStateHolder();
  }

  isReady(): boolean {
    return (
      getRuntimeSessionStateHolder().status === RUNTIME_SESSION_STATUS.ready
    );
  }

  getResult(): RuntimeSessionResult | null {
    return getRuntimeSessionStateHolder().result;
  }
}
