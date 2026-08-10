import type { BootstrapResult } from "./BootstrapResult";
import type { BootstrapState } from "./BootstrapState";
import {
  getBootstrapStateHolder,
} from "./BootstrapStateHolder";
import type { BootstrapStatus } from "./BootstrapStatus";
import { BOOTSTRAP_STATUS } from "./BootstrapStatus";

/**
 * Read-only facade over the process-wide Runtime Bootstrap state.
 * Resolved from the Composition Root after bootstrap completes.
 */
export class RuntimeBootstrapService {
  getStatus(): BootstrapStatus {
    return getBootstrapStateHolder().status;
  }

  getState(): BootstrapState {
    return getBootstrapStateHolder();
  }

  isReady(): boolean {
    return getBootstrapStateHolder().status === BOOTSTRAP_STATUS.ready;
  }

  getResult(): BootstrapResult | null {
    return getBootstrapStateHolder().result;
  }
}
