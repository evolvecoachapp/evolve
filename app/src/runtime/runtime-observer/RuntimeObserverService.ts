import type { RuntimeObserverResult } from "./RuntimeObserverResult";
import type { RuntimeObserverState } from "./RuntimeObserverState";
import { getRuntimeObserverStateHolder } from "./RuntimeObserverStateHolder";
import type { RuntimeObserverStatus } from "./RuntimeObserverStatus";
import { RUNTIME_OBSERVER_STATUS } from "./RuntimeObserverStatus";

/**
 * Read-only facade over the process-wide Runtime Change Observer state.
 * Resolved from the Composition Root after bootstrap completes.
 */
export class RuntimeObserverService {
  getStatus(): RuntimeObserverStatus {
    return getRuntimeObserverStateHolder().status;
  }

  getState(): RuntimeObserverState {
    return getRuntimeObserverStateHolder();
  }

  isReady(): boolean {
    return (
      getRuntimeObserverStateHolder().status === RUNTIME_OBSERVER_STATUS.ready
    );
  }

  getResult(): RuntimeObserverResult | null {
    return getRuntimeObserverStateHolder().result;
  }
}
